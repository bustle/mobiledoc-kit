var gulp   = require('gulp');
var jshint = require('gulp-jshint');
var qunit  = require('gulp-qunit');
var less   = require('gulp-less');
var concat = require('gulp-concat');
var header = require('gulp-header');
var util   = require('gulp-util');
var open   = require('gulp-open');
var rimraf = require('gulp-rimraf');
var insert = require('gulp-insert');
var runSequence = require('run-sequence');

// ------------------------------------------- 

var pkg = require('./package.json');

var jsSrc = [
  './src/js/index.js',
  './src/js/constants.js',
  './src/js/utils/object-utils.js',
  './src/js/utils/element-utils.js',
  './src/js/utils/selection-utils.js',
  './src/js/prompt.js',
  './src/js/commands.js',
  './src/js/editor.js',
  './src/js/toolbar.js',
  './src/js/toolbar-button.js',
  './src/js/tooltip.js',
  './src/js/embed-intent.js'
];

var jsExtSrc = './src/js/ext/*';

var cssSrc = [
  './src/css/editor.less',
  './src/css/toolbar.less',
  './src/css/tooltip.less',
  './src/css/embeds.less',
  './src/css/icons.less',
  './src/css/animations.less'
];

var distDest = './dist/';
var jsDistName = 'content-kit-editor.js';
var jsDistPath = distDest + jsDistName;
var cssDistName = 'content-kit-editor.css';

var testRunner = './tests/index.html';
var demo       = './demo/index.html';

var banner = ['/*!',
              ' * @overview <%= pkg.name %>: <%= pkg.description %>',
              ' * @version  <%= pkg.version %>',
              ' * @author   <%= pkg.author %>',
              ' * @license  <%= pkg.license %>',
              ' * Last modified: ' + util.date('mmm d, yyyy'),
              ' */',
              ''].join('\n'); 

var iifeHeader = ['',
                  '(function(exports, document) {',
                  '',
                  '\'use strict\';',
                  '',
                  ''].join('\n'); 
var iifeFooter = ['',
                  '}(this, document));',
                  ''].join('\n'); 


// JSHint javascript code linting
gulp.task('lint', function() {
  return gulp.src(jsSrc)
             .pipe(jshint('.jshintrc'))
             .pipe(jshint.reporter('default'));
});

// Concatenates and builds javascript source code
gulp.task('build-js-src', function() {
  return gulp.src(jsSrc)
             .pipe(concat(jsDistName))
             .pipe(insert.wrap(iifeHeader, iifeFooter))
             .pipe(header(banner, { pkg : pkg } ))
            . pipe(gulp.dest(distDest));
});

// Concatenates external js dependencies with built js source
gulp.task('build-js-ext', ['build-js-src'], function() {
  return gulp.src([jsDistPath, jsExtSrc])
             .pipe(concat(jsDistName))
             .pipe(gulp.dest(distDest));
});

// Builds final js output in sequence (tasks are order dependent)
gulp.task('build-js', ['build-js-src', 'build-js-ext'], function() {
  return runSequence('build-js-src', 'build-js-ext');
});

// Compiles LESS and concatenates css
gulp.task('build-css', function() {
  return gulp.src(cssSrc)
             .pipe(concat(cssDistName))
             .pipe(less())
             .pipe(gulp.dest(distDest));
});

// Builds the entire suite of js/css
gulp.task('build', ['build-css', 'build-js']);

// Runs QUnit tests
gulp.task('test', ['build'], function() {
  return gulp.src(testRunner).pipe(qunit());
});

// Opens the test runner in your default browser
gulp.task('test-browser', ['build'], function(){
  return gulp.src(testRunner).pipe(open('<% file.path %>')); 
});

// Opens the demo in your default browser
gulp.task('demo', function(){
  return gulp.src(demo).pipe(open('<% file.path %>')); 
});

// Removes built output files
gulp.task('clean', function() {
  return gulp.src(distDest + '*', { read: false }).pipe(rimraf());
});

// Watches when js files change and automatically lints/builds
gulp.task('watch-js', function() {
  gulp.watch(jsSrc.concat(jsExtSrc), ['lint', 'build-js']);
});

// Watches when css files change and automatically builds
gulp.task('watch-css', function() {
  gulp.watch(cssSrc, ['build-css']);
});

// Watches when any files change and automatically builds
gulp.task('watch', ['watch-js', 'watch-css']);

// Default task
gulp.task('default', ['lint', 'build', 'test']);
