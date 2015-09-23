
var gulp = require('gulp');
var gutil = require('gulp-util');
var coffee = require('gulp-coffee');
var source = require('vinyl-source-stream');
var transform = require('vinyl-transform');
var assign = require('lodash.assign');

var watchify = require('watchify');
var browserify = require('browserify');
var coffeeify = require('coffeeify');

var customOpts = {
  entries: ['./chrome/main.coffee'],
  extensions: ['.coffee', '.js']
};
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));
b.transform(coffeeify);

gulp.task('chrome', bundle);
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./chrome/'));
}

var paths = {
  metal: ['./main.coffee', './metal/**/*.coffee'],
  chrome: ['./chrome/**/*.coffee']
};

gulp.task('metal', function() {
  return gulp.src(paths.metal, { base: './' })
    .pipe(coffee())
    .pipe(gulp.dest('.'));
});

gulp.task('watch', function () {
  gulp.watch(paths.metal, ['metal']);
  gulp.watch(paths.chrome, ['chrome']);
});

gulp.task('default', ['watch']);

