var gulp   = require('gulp');
var jshint = require('gulp-jshint');
var qunit  = require('gulp-qunit');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var header = require('gulp-header');
var footer = require('gulp-footer');
var util   = require('gulp-util');
var open   = require('gulp-open');

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

var cssSrc = [
  './src/css/editor.css',
  './src/css/toolbar.css',
  './src/css/tooltip.css',
  './src/css/embeds.css',
  './src/css/icons.css',
  './src/css/animations.css'
];

var distDest = './dist/';
var jsDistName = 'content-kit-editor.js';
var jsDistPath = distDest + jsDistName;
var cssDistName = 'content-kit-editor.css';
var cssDistPath = distDest + cssDistName;

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

gulp.task('lint', function() {
  gulp.src(jsSrc)
      .pipe(jshint('.jshintrc'))
      .pipe(jshint.reporter('default'));
});

gulp.task('lint-built', function() {
  return gulp.src(jsDistPath)
             .pipe(jshint('.jshintrc'))
             .pipe(jshint.reporter('default'));
});

gulp.task('build', function() {
  gulp.src(jsSrc)
      .pipe(concat(jsDistName))
      .pipe(header(iifeHeader))
      .pipe(header(banner, { pkg : pkg } ))
      .pipe(footer(iifeFooter))
      .pipe(gulp.dest(distDest));

  gulp.src(cssSrc)
      .pipe(concat(cssDistName))
      .pipe(gulp.dest(distDest));
});

gulp.task('test', function() {
  return gulp.src(testRunner)
             .pipe(qunit());
});

gulp.task('test-browser', function(){
  return gulp.src(testRunner)
             .pipe(open('<% file.path %>')); 
});

gulp.task('demo', function(){
  return gulp.src(demo)
             .pipe(open('<% file.path %>')); 
});

gulp.task('watch', function() {
  gulp.watch(jsSrc.concat(cssSrc), ['build']);
});


gulp.task('default', ['lint', 'build', 'lint-built', 'test']);
