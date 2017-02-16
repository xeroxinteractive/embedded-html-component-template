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

var BROWSERS          = ["last 2 versions", "> 5% in US", "ie 11"];

/* ------------------------------------------------- */

gulp.task('clean', function () {
    return gulp.src(['./dist', './dist.zip', './css'], {read: false})
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
  return gulp.src('./sass/**/*.scss')
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
  gulp.watch('./sass/**/*.scss', ['sass']);
});

/* ------------------------------------------------- */

gulp.task('watch', ['sass', 'watch:sass', 'lint', 'watch:lint']);

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
    ['sass', 'lint'],
    ['dist:move-source', 'dist:zip-assets', 'dist:move-html'],
    cb);
});

gulp.task('dist:move-source', function() {
  return gulp.src(['./**/*', '!./node_modules/', '!./node_modules/**/*', '!./css', '!./css/**/*'])
    .pipe(gulp.dest('./dist/source'));
});

gulp.task('dist:zip-assets', function() {
  return gulp.src(['./css/**/*', './images/**/*', './js/**/*', './contrib/**/*', '!./**/*.md'], {'base' : './'})
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

          $('head').children().prependTo("html");
          $('body').children().appendTo("html");
          $('head').remove();
          $('body').remove();
          $('html').replaceWith("<div>" + $('html').html() + "</div>")

          return this;
      },
      "parserOptions": {
        "decodeEntities" : false
      }
      }))
    .pipe(replace('<!DOCTYPE html>', ''))
    .pipe(replace(/(\n|\r|  )/g, ''))
    .pipe(replace(/<([/]?)([a-zA-Z]*)[^>]*([/]?)>/g, function(search, openSlash, tag, closeSlash) {
      tag = tag.toLowerCase();
      var isVoidElement = voidElements.indexOf(tag) > -1;
      var isOpenTag = !openSlash;
      var isCloseTag = !!closeSlash || !!openSlash;
      var isEmptyElement = false;

      isEmptyElement = isEmptyElement || (tag == "script" && search.indexOf("src=") > -1);

      if (isOpenTag) {
        depth++;
      }
      if (isCloseTag || isVoidElement) {
        depth--;
      }

      if (!isEmptyElement) 
      {
        if (isCloseTag) {
          if (depth > 0) {
            search = "  ".repeat(depth) + search;
          }
          search = "\n" + search;
        }

        search += "\n";
        if (depth > 0) {
          search += "  ".repeat(depth);
        }
      }
      
      return search;
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