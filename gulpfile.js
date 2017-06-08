var gulp = require('gulp'); // Gulp.
var gulpShowdown = require('gulp-showdown'); // Markdown processing.
var through = require("through2");
var fs = require("fs");
var path = require("path");
var templates = ["concepts", "guides", "index", "regular"];
var templateContents = {};
for (var ind = 0; ind < templates.length; ind++) {
  templateContents[templates[ind]] = fs.readFileSync("./templates/" + templates[ind] + ".html", "utf8");
}
var lastPath;

function applyTemplatesAndModifiers() {
  return through.obj(function(file, encoding, cb) {
    if (file.path === lastPath) return cb(null, file);
    lastPath = file.path;
    var contents = file.contents.toString();
    var newContents = contents;
    var template = "default";
    var style = "";
    if (/^<!-- Modifiers: ?[\w,]+ ?-->/.test(contents)) {
      var newContents = newContents.replace(/^<!-- Modifiers: ?([\w,]+) ?-->$/, "");
      var modifiers = contents.match(/^<!-- Modifiers: ?([\w,]+) ?-->/)[1].split(",");
      for (var i = 0; i < modifiers.length; i++) {
        var item = modifiers[i];
        if (item === "img_small") {
          style += "img { width: 75%; }";
        } else if (item === "index") {
          style += "img { display: block; margin: auto; }";
          template = "index";
        } else if (/^center_[a-z\d]+$/i.test(item)) {
          style += item.match(/^center_([a-z\d]+)$/)[1] + " { text-align: center; }";
        } else if (item === "main_guides") {
          template = "guides";
        } else if (item === "main_concepts") {
          template = "concepts";
        }
      }
    }
    newContents = newContents.replace(/\n/g, "\n" + (" ".repeat(template === "default" ? 8 : 6)));
    var fileToUse = "";
    if (template === "index" || template === "guides" || template === "concepts") {
      fileToUse = template;
    } else {
      fileToUse = "regular";
    }
    var templateContent = templateContents[fileToUse]
      .replace("%1", style)
      .replace("%2", newContents);
    file.contents = Buffer.from(templateContent);
    cb(null, file);
  });
}

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
    .pipe(applyTemplatesAndModifiers())
    .pipe(gulp.dest('tanks'));
  gulp.src("md/main/*.md")
    .pipe(gulpShowdown(showdownOpts))
    .pipe(applyTemplatesAndModifiers())
    .pipe(gulp.dest("./"));
});

gulp.task("default", ["md2html"]);
