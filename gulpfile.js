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
var es6ModuleTranspiler = require('gulp-es6-module-transpiler');

// ------------------------------------------- 

var pkg = require('./package.json');

var jsSrc = [
  './src/js/content-kit.js',
  './src/js/**/*.js'
];

var cssSrc = [
  './src/css/variables.less',
  './src/css/editor.less',
  './src/css/toolbar.less',
  './src/css/tooltip.less',
  './src/css/embeds.less',
  './src/css/message.less',
  './src/css/icons.less',
  './src/css/animations.less'
];

var distDest = './dist/';
var jsDistName = 'content-kit-editor.js';
var jsDistPath = distDest + jsDistName;
var cssDistName = 'content-kit-editor.css';

var testRunner = './tests/index.html';
var testScripts = './tests/**/*.js';

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

gulp.task('build-js', ['lint'], function() {
  return gulp.src(jsSrc)
             .pipe(es6ModuleTranspiler({ type: 'amd' }))
             .pipe(concat(jsDistName))
             .pipe(insert.wrap(iifeHeader, iifeFooter))
             .pipe(header(banner, { pkg : pkg } ))
             .pipe(gulp.dest(distDest));
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
  gulp.watch(jsSrc, ['lint', 'build-js']);
});

// Watches test files change and automatically tests
gulp.task('watch-tests', function() {
  gulp.watch(testScripts, ['test']);
});

// Watches when css files change and automatically builds
gulp.task('watch-css', function() {
  gulp.watch(cssSrc, ['build-css']);
});

// Watches when any files change and automatically tests/builds
gulp.task('watch', ['watch-js', 'watch-tests', 'watch-css']);

// Default task
gulp.task('default', ['lint', 'build', 'test']);
