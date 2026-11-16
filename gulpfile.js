var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var merge = require('merge-stream');
var pkg = require('./package.json');

var banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  ''
].join('');

function compileSass() {
  return gulp.src('scss/resume.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({
      stream: true
    }));
}

function minifyCss() {
  return gulp.src('css/resume.css')
    .pipe(cleanCSS({
      compatibility: 'ie8'
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({
      stream: true
    }));
}

function minifyJs() {
  return gulp.src('js/resume.js')
    .pipe(uglify())
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('js'))
    .pipe(browserSync.reload({
      stream: true
    }));
}

function copyVendor() {
  var bootstrap = gulp.src([
      'node_modules/bootstrap/dist/**/*',
      '!**/npm.js',
      '!**/bootstrap-theme.*',
      '!**/*.map'
    ], { allowEmpty: true })
    .pipe(gulp.dest('vendor/bootstrap'));

  var jquery = gulp.src([
      'node_modules/jquery/dist/jquery.js',
      'node_modules/jquery/dist/jquery.min.js'
    ], { allowEmpty: true })
    .pipe(gulp.dest('vendor/jquery'));

  var easing = gulp.src(['node_modules/jquery.easing/*.js'], { allowEmpty: true })
    .pipe(gulp.dest('vendor/jquery-easing'));

  var fontAwesome = gulp.src([
      'node_modules/font-awesome/**',
      '!node_modules/font-awesome/**/*.map',
      '!node_modules/font-awesome/.npmignore',
      '!node_modules/font-awesome/*.txt',
      '!node_modules/font-awesome/*.md',
      '!node_modules/font-awesome/*.json'
    ], { allowEmpty: true })
    .pipe(gulp.dest('vendor/font-awesome'));

  var devicons = gulp.src([
      'node_modules/devicons/**/*',
      '!node_modules/devicons/*.json',
      '!node_modules/devicons/*.md',
      '!node_modules/devicons/!PNG',
      '!node_modules/devicons/!PNG/**/*',
      '!node_modules/devicons/!SVG',
      '!node_modules/devicons/!SVG/**/*'
    ], { allowEmpty: true })
    .pipe(gulp.dest('vendor/devicons'));

  var simpleLineIcons = gulp.src([
      'node_modules/simple-line-icons/**/*',
      '!node_modules/simple-line-icons/*.json',
      '!node_modules/simple-line-icons/*.md'
    ], { allowEmpty: true })
    .pipe(gulp.dest('vendor/simple-line-icons'));

  return merge(bootstrap, jquery, easing, fontAwesome, devicons, simpleLineIcons);
}

function collectDist() {
  return gulp.src([
    'index.html',
    'css/**/*',
    'js/**/*',
    'img/**/*',
    'vendor/**/*'
  ], { base: '.', allowEmpty: true })
    .pipe(gulp.dest('dist'));
}

function serve(done) {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });
  done();
}

function watch() {
  gulp.watch('scss/*.scss', gulp.series(compileSass, minifyCss));
  gulp.watch('js/resume.js', minifyJs);
  gulp.watch('*.html').on('change', browserSync.reload);
}

gulp.task('sass', compileSass);
gulp.task('minify-css', gulp.series(compileSass, minifyCss));
gulp.task('minify-js', minifyJs);
gulp.task('copy', copyVendor);
gulp.task('dist', collectDist);
gulp.task('browserSync', serve);
gulp.task('dev', gulp.series(
  gulp.parallel(compileSass, minifyJs),
  minifyCss,
  serve,
  watch
));
gulp.task('default', gulp.series(
  compileSass,
  gulp.parallel(minifyCss, minifyJs),
  collectDist
));
