"use strict";
var gulp = require('gulp');
var gls = require('gulp-live-server');
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var opn = require('opn');
var jshint = require('gulp-jshint');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var zip = require('gulp-zip');

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

gulp.task('dist', ['clean', 'dist:move-source', 'dist:zip-assets', 'dist:move-html'], function(cb) {
  runSequence(
    ['clean'],
    ['sass', 'lint'],
    ['dist:move-source', 'dist:zip-assets', 'dist:move-html'],
    ['dist:zip-dist'],
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
  return gulp.src(['./*.html'])
    .pipe(gulp.dest('./dist/prepared/'));
});

gulp.task('dist:zip-dist', function() {
  return gulp.src(['./dist/**/*'])
    .pipe(zip('dist.zip'))
    .pipe(gulp.dest('./'));
});