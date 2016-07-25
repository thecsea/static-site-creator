var gulp = require('gulp');
var gulpif = require('gulp-if');
var argv = require('yargs').argv;
var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var templateCache = require('gulp-angular-templatecache');
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var csso = require('gulp-csso');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var browserify = require('gulp-browserify');
const babel = require('gulp-babel');

gulp.task('sass', function() {
  return gulp.src('public/css/main.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulpif(argv.production, csso()))
    .pipe(gulp.dest('public/css'));
});

gulp.task('angular', function() {
  return gulp.src([
    'app/app.js',
    'app/controllers/*.js',
    'app/services/*.js'
  ])
    .pipe(concat('application.js'))
    .pipe(ngAnnotate())
    .pipe(gulpif(argv.production, uglify()))
    .pipe(gulp.dest('public/js'));
});

gulp.task('templates', function() {
  return gulp.src('app/partials/**/*.html')
    .pipe(templateCache({ root: 'partials', module: 'MyApp' }))
    .pipe(gulpif(argv.production, uglify()))
    .pipe(gulp.dest('public/js'));
});

gulp.task('vendor', function() {
  return gulp.src('app/vendor/*.js')
    .pipe(gulpif(argv.production, uglify()))
    .pipe(gulp.dest('public/js/lib'));
});

// Basic usage
gulp.task('libs', function() {
  // Single entry point to browserify
  gulp.src('app/libs/libs.js')
      .pipe(babel({
          presets: ['es2015']
      }))
      .pipe(browserify({
        insertGlobals : true,
        debug : !argv.production
      }))
      .pipe(gulpif(argv.production, uglify()))
      .pipe(gulp.dest('public/js'))
});

gulp.task('watch', function() {
  gulp.watch('public/css/**/*.scss', ['sass']);
  gulp.watch('app/partials/**/*.html', ['templates']);
  gulp.watch('app/**/*.js',  ['angular']);
  gulp.watch('app/libs/**/*.js',  ['libs']);
});

gulp.task('build', ['sass', 'angular', 'vendor', 'templates', 'libs']);
gulp.task('default', ['build', 'watch']);
