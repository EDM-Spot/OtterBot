const gulp     = require("gulp");
const sass     = require("gulp-sass");
const rename   = require("gulp-rename");
const cleanCSS = require("gulp-clean-css");

const build = {
  assets: {
    static: () => gulp.src(["dashboard/public/css/**/*", "!dashboard/public/css/**/*.scss"])
      .pipe(gulp.dest("dashboard/public/css")),
    sass: () => gulp.src("dashboard/public/css/**/*.scss")
      .pipe(sass().on("error", sass.logError))
      .pipe(gulp.dest("dashboard/public/css"))
  }
};

const minify = {
  css: () => gulp.src(["dashboard/public/css/**/*.css", "!dashboard/public/css/**/*.min.css"])
    .pipe(cleanCSS())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest("dashboard/public/css"))
};

const Default = gulp.series(
  build.assets.static,
  build.assets.sass,
  minify.css
);

const Scss = gulp.series(
  build.assets.sass,
  minify.css,
);

exports.default = Default;
exports.scss = Scss;
exports.watch = () => gulp.watch(["dashboard/public/css/**/*"], Default);