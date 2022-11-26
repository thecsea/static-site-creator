var gulp = require('gulp');
var gulpif = require('gulp-if');
var argv = require('yargs').argv;
var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var templateCache = require('gulp-angular-templatecache');
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass')(require('sass'));
var csso = require('gulp-csso');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

gulp.task('sass', function() {
  return gulp.src('public/css/app.sass')
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
    //.pipe(gulpif(argv.production, uglify()))//TODO fix
    .pipe(gulp.dest('public/js'));
});

gulp.task('angularLibs', function() {
  return gulp.src([
    'node_modules/angular-base64-upload/dist/angular-base64-upload.js',
    'node_modules/checklist-model/checklist-model.js',
  ])
      .pipe(concat('angular-lib.js'))
      //.pipe(gulpif(argv.production, uglify()))//TODO FIX
      .pipe(gulp.dest('public/js/lib'));
});

gulp.task('templates', function() {
  return gulp.src('app/partials/**/*.html')
    .pipe(templateCache({ root: 'partials', module: 'MyApp' }))
    //.pipe(gulpif(argv.production, uglify()))//TODO FIX
    .pipe(gulp.dest('public/js'));
});

gulp.task('vendor', function() {
  return gulp.src('app/vendor/*.js')
    //.pipe(gulpif(argv.production, uglify()))//TODO FIX
    .pipe(gulp.dest('public/js/lib'));
});

//browserify libs with ES6 support
gulp.task('libs', function() {
    return browserify('app/libs/libs.js', {
      insertGlobals : true,
      debug : !argv.production
    })
    .transform('brfs')
    .transform(babelify, {presets: ["es2015"]})
    .bundle()
    .pipe(source('libs.js'))
    .pipe(buffer())
    //.pipe(fs.createWriteStream("bundle.js"));
    //.pipe(gulpif(argv.production, uglify()))//TODO FIX
    .pipe(gulp.dest('public/js'))
});

gulp.task('watch', function() {
  gulp.watch('public/css/**/*.sass', ['sass']);
  gulp.watch('app/partials/**/*.html', ['templates']);
  gulp.watch('app/**/*.js',  ['angular']);
  gulp.watch('app/libs/**/*',  ['libs']);
});

gulp.task('build', ['sass', 'angular', 'vendor', 'templates', 'libs', 'angularLibs']);
gulp.task('default', ['build', 'watch']);
