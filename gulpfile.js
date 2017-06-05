var gulp = require('gulp'); // Gulp.
var gulpShowdown = require('gulp-showdown'); // Markdown processing.

gulp.task("md2html", function() {
  var showdownOpts = {
    ghCompatibleHeaderId: true,
    parseImgDimensions: true,
    tasklists: true,
    tables: true,
    strikethrough: true,
    simplifiedAutoLink: true,
    excludeTrailingPunctuationFromURLs: true,
    requireSpaceBeforeHeadingText: true,
    simpleLineBreaks: true
  };
  gulp.src("md/**/*.md")
    .pipe(gulpShowdown(showdownOpts))
    .pipe(gulp.dest('tanks'))
});

gulp.task("default", ["md2html"]);

// WIP
