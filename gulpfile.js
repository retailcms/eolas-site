// Install:

// sudo chown -R $USER /usr/local
// npm install -g gulp
// npm install gulp-sass
// npm install --save-dev gulp-autoprefixer
// npm install --save-dev gulp del
// npm install --save-dev run-sequence
// npm install --save-dev gulp-connect
// npm install browser-sync gulp --save-dev
// Run:

// gulp

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    del = require('del'),
    sequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    autoprefixer = require('gulp-autoprefixer'),
    fileinclude = require('gulp-file-include');

var destPath = './dist/';

gulp.task('clean', function(cb) {
  // Delete everything in dist/.
  del([
    'dist/**/*.*'
  ], cb);
});

// Set up search indexing source files - content.xml, glossary.xml 

//var search = require('./src/utility-scripts/search2/index.js');
//search.addContentXml('src/content/test/content.xml');
//search.addContentXml('src/content/m1/content.xml');
//search.addGlossaryXml('src/content/glossary.xml');


// Run search indexer
// gulp.task('search', function() {
//   search.build('dist/content/search-index.json');
// });


// Offline content.xml translations
// var trans = require('./src/utility-scripts/jstranslations/index.js');
// gulp.task('translations', function(cb) {
//   trans.process(cb);
// });


// Offline references.xml 
// var references = require('./src/utility-scripts/jsreferences/index.js');

// gulp.task('references', function(cb) {
//   references.process(cb);
// });


// Offline glossary.xml 
// var glossary = require('./src/utility-scripts/jsglossary/index.js');
// gulp.task('glossary', function() {
//   glossary.process();
// });


gulp.task('moveContent', function() {

  // Move index file
  gulp.src(['src/index.html'])
    .pipe(gulp.dest(destPath));

  gulp.src(['src/.htaccess'])
    .pipe(gulp.dest(destPath));

  // Move non-HTML content directly
  gulp.src(['src/content/**/*.!(html)'])
    .pipe(gulp.dest(destPath + '/content/'));


  // Allow includes in HTML files
  return gulp.src(['src/content/**/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest(destPath + '/content/'));



  // return gulp.src(['src/content/**/*.*'])
  //   .pipe(fileinclude({
  //     prefix: '@@',
  //     basepath: '@file'
  //   }))
  //   .pipe(gulp.dest(destPath + '/content/'));
});

// Move content
gulp.task('content', function() {

  // sequence('moveContent', 'translations', 'references', 'glossary');
  sequence('moveContent');

});

// JS task
gulp.task('js', function() {

  // Move to 'content' folder
  gulp.src(['src/plugins/**/*.js'])
    .pipe(gulp.dest(destPath + '/plugins/'));

  // Move to 'content' folder
  //gulp.src(['src/player/**/*.js'])
    //.pipe(gulp.dest(destPath + '/player/'));

});

// SASS task
// Builds SCSS files to CSS
gulp.task('sass', function() {

  gulp.src('src/assets/scss/*.scss')
    .pipe(sass({
      style: 'expanded',
      sourcemap: true
    }))
    .pipe(autoprefixer({
      browsers: ['last 3 versions'],
      cascade: false
    }))
    .pipe(gulp.dest(destPath + '/assets/css/'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// CSS task
gulp.task('css', function() {
  gulp.src('src/assets/css/*.css')
    .pipe(gulp.dest(destPath + '/assets/css/'));
});

// Image task
// Builds Image files to assets/images
// For global imagery
gulp.task('images', function() {
  gulp.src('src/assets/images/**/*.*')
    .pipe(gulp.dest(destPath + '/assets/images/'));
});

// Fonts task
// Builds SCSS files to CSS
gulp.task('fonts', function() {
  gulp.src('src/assets/fonts/**/*.*')
    .pipe(gulp.dest(destPath + '/assets/fonts/'));
});

gulp.task('libs', function() {
  gulp.src('src/libs/**/*.*')
    .pipe(gulp.dest(destPath + '/libs/'));
});

// Gulp webserver
gulp.task('serve', function() {
  // Reload browsers
  browserSync({
    server: {
      baseDir: "./dist/"
    }
  });
});

// Full build - clean build folder, build js, build html
gulp.task('default', function() {
  return sequence(
    'clean', ['content', 'libs', 'js', 'fonts', 'images', 'css', 'sass', 'watch', 'serve']
    // 'clean', ['content', 'libs', 'js', 'fonts', 'images', 'css', 'sass', 'watch', 'search', 'translations', 'serve']
  );

});

// Watchers
var watchEventHandler = function(event) {
  console.log('Event type: ' + event.type); // added, changed, or deleted
  console.log('Event path: ' + event.path);
};

gulp.task('watch', function() {
  w1 = gulp.watch('src/assets/scss/*.scss', ['sass']);
  w1.on('change', watchEventHandler);

  w2 = gulp.watch('src/assets/images/**/*.*', ['images', browserSync.reload]);
  w2.on('change', watchEventHandler);

  // w3 = gulp.watch('src/content/**/*.*', ['content', 'search', browserSync.reload]);
  w3 = gulp.watch('src/content/**/*.*', ['content', browserSync.reload]);
  w3.on('change', watchEventHandler);

  w4 = gulp.watch('src/plugins/**/*.*', ['js', browserSync.reload]);
  w4.on('change', watchEventHandler);

  w5 = gulp.watch('src/index.html', ['content', browserSync.reload]);
  w5.on('change', watchEventHandler);
});
