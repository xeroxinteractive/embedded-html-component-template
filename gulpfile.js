"use strict";
var gulp        = require('gulp');
var gls         = require('gulp-live-server');
var sass        = require('gulp-sass');
var gutil       = require('gulp-util');
var opn         = require('opn');
var jshint      = require('gulp-jshint');
var clean       = require('gulp-clean');
var runSequence = require('run-sequence');
var zip         = require('gulp-zip');
var cheerio     = require('gulp-cheerio');
var replace     = require('gulp-replace');
var rename      = require("gulp-rename");
var cssnano     = require('gulp-cssnano');
var mustache    = require('gulp-mustache');
var htmltidy    = require('gulp-htmltidy');
var flatmap     = require('gulp-flatmap');
var filter      = require('gulp-filter');
var uglify      = require('gulp-uglify');
var debug       = require('gulp-debug');
var clone       = require('gulp-clone');
var cloneSink   = clone.sink();

var BROWSERS    = ["last 2 versions", "> 5% in US", "ie 11"];

/* ------------------------------------------------- */

gulp.task('clean', function () {
    return gulp.src(['./dist', './dist.zip', './css', './*.html'], {read: false})
        .pipe(clean());
});

/* ------------------------------------------------- */

gulp.task('lint', function() {
  return gulp.src('./js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('watch:lint', function() {
  gulp.watch('./js/**/*.js', ['lint']);
});

/* ------------------------------------------------- */
 
gulp.task('sass', function () {
  return gulp.src('./sass/**/*.{scss,sass}')
    .pipe(sass().on('error', gutil.log))
    .pipe(cssnano({
      zindex: false,
      core: false,
      mergeRules: false,
      discardComments: false,
      autoprefixer: {
        browsers : BROWSERS,
        add: true,
        remove: true
      }
    }))
    .pipe(gulp.dest('./css'))
    .pipe(cssnano({
      zindex: false,
      autoprefixer: {
        browsers : BROWSERS,
        add: true,
        remove: true
      }
    }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./css'));
});
 
gulp.task('watch:sass', function () {
  gulp.watch('./sass/**/*.{scss,sass}', ['sass']);
});

/* ------------------------------------------------- */

gulp.task('mustache', function () {
  return gulp.src('./mustache/*.mustache')
    .pipe(mustache("./data/en-us.json"))
    .pipe(rename({extname: ".html"}))
    .pipe(gulp.dest('./'));
});

gulp.task('mustache:langs', function () {
  return gulp.src("./data/*.json")
  .pipe(flatmap(function(stream, file){
    var data = JSON.parse(file.contents.toString('utf-8'));
    var name = file.relative.replace(".json", "");
    return gulp.src('./mustache/*.mustache')
      .pipe(mustache(data))
      .pipe(rename(function(path){
        path.extname = ".html";
        path.basename += "-" + name;
      }))
      .pipe(gulp.dest('./'));
  })); 
  
  
});
 
gulp.task('watch:mustache', function () {
  gulp.watch(['./mustache/**/*.mustache', './data/*.json'], ['mustache', 'mustache:langs']);
});

/* ------------------------------------------------- */

gulp.task('watch', ['mustache', 'mustache:langs', 'watch:mustache', 'sass', 'watch:sass', 'lint', 'watch:lint']);

/* ------------------------------------------------- */

gulp.task('serve', ['watch'], function() {
  var server = gls.static('./');
  server.start();
 
  gulp.watch(['./css/**/*.css', './js/**/*.js', './**/*.html'], function (file) {
    server.notify.apply(server, [file]);
  });

  opn('http://localhost:3000/', {app: ['chrome', '']});
});

/* ------------------------------------------------- */

gulp.task('dist', function(cb) {
  runSequence(
    ['clean'],
    ['dist:build'],
    ['dist:zip-dist'],
    ['dist:clean-dist'],
    cb);
});

gulp.task('dist:build', function(cb) {
  runSequence(
    ['clean'],
    ['mustache:langs', 'sass', 'lint'],
    ['dist:move-source', 'dist:zip-assets', 'dist:move-html'],
    cb);
});

gulp.task('dist:move-source', function() {
  return gulp.src(['./**/*', '!./node_modules/', '!./node_modules/**/*', '!./css', '!./css/**/*', '!./*.html'])
    .pipe(gulp.dest('./dist/source'));
});

gulp.task('dist:zip-assets', function() {
  const jsFilter = filter(['**/*.js', '!**/*.min.js'], {restore: true});

  return gulp.src(['./css/**/*', './images/**/*', './js/**/*', './contrib/**/*', '!./**/*.md', , '!./**/component-dev.*'], {'base' : './'})
    .pipe(debug({title: 'pre:'}))
    .pipe(jsFilter)
      .pipe(debug({title: 'uglify-pre:'}))
      .pipe(cloneSink)
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
      .pipe(cloneSink.tap()) 
      .pipe(debug({title: 'uglify-post:'}))
    .pipe(jsFilter.restore)
    .pipe(debug({title: 'post:'}))
    .pipe(zip('assets.zip'))
    .pipe(gulp.dest('./dist/prepared/'));
});

gulp.task('dist:move-html', function() {
  var depth = 0;
  var voidElements = ["meta", "img", "link", "br", "param", "input", "hr", "col", "area"];

  return gulp.src(['./*.html'])
    .pipe(cheerio({
        "run" : function ($, file) {
          $('[data-xrxremove]').remove();

          var pathsRelative = function(index, attr) {
            if (attr)
            {
              if (attr.indexOf("http") !== 0 && attr.indexOf("/") !== 0)
              {
                return "~/" + attr;
              }
            }

            return attr;
          };
          
          $('link').attr("href", pathsRelative);
          $('script,img').attr("src", pathsRelative);
          $('video').attr("poster", pathsRelative);
          $('source').attr("src", pathsRelative);

          var stylesRelative = function(index, attr) {
            if (attr)
            {
              var styles = attr.split(";");

              attr = attr.replace(/url\('images\//g, "url('~/images/").replace(/url\("images\//g, "url(\"~/images/");
              return attr;
            }

            return null;
          };
          $('*').attr("style", stylesRelative);

          $('html link[href]').prependTo(".xrx-wrapper");
          $('html script[src]').appendTo(".xrx-wrapper");
          $('.xrx-wrapper').appendTo("body");
          $('.xrx-wrapper').removeAttr("class").removeAttr("id");
          $('.xrx-container').remove();
          $('head').remove();

          return this;
      },
      "parserOptions": {
        "decodeEntities" : false
      }
    }))
    .pipe(htmltidy({
      doctype: 'html5',
      hideComments: true,
      indent: true,
      wrap: 0,
      doctype: "omit",
      "show-body-only": true
    }))
    .pipe(gulp.dest('./dist/prepared/'));
});

gulp.task('dist:zip-dist', function() {
  return gulp.src(['./dist/**/*'])
    .pipe(zip('dist.zip'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('dist:clean-dist', function() {
  return gulp.src(['./dist/prepared', './dist/source'], {read: false})
        .pipe(clean());
});