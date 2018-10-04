"use strict";

const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const babelify = require('babelify');
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");

// Load all required plugins (listed in package.json)
const plugins = require("gulp-load-plugins")({
  pattern: "*"
});

console.log(plugins); // Logs loaded plugins in terminal

const reload = plugins.browserSync.reload;

// Loads BrowserSync
gulp.task("browser-sync", () => {
  plugins.browserSync.init({
    open: false,
    server: {
      baseDir: "./app"
    }
  });
});

// Renders Nunjucks
gulp.task("njk", () =>
  // Gets .html and .njk files in pages
  gulp
    .src("./app/pages/**/*.+(html|njk)")
    // Adding data to Nunjucks
    .pipe(
      plugins.data(() => {
        return require("./app/data.json");
      })
    )
    // Renders template with nunjucks
    .pipe(
      plugins.nunjucksRender({
        path: ["./app/templates"]
      })
    )
    // output files in app folder
    .pipe(gulp.dest("./app"))
);

// Compile Sass
gulp.task("styles", () =>
  gulp
    .src("./app/assets/scss/index.scss")
    .pipe(
      plugins.sass({
        onError: function(err) {
          return notify().write(err);
        }
      })
    )
    .pipe(gulp.dest("./app/assets/css/"))
);

// Compile JS
gulp.task("scripts", () =>
  gulp
    .src("./app/assets/js/**/*.js")
    .pipe(plugins.concat("index.js"))
    .pipe(gulp.dest("./app/assets/js/"))
);

gulp.task("babel", () =>

    browserify({
        entries: ["./app/assets/es2015/index.js"]
    })
    .transform(babelify.configure({
        presets : ["@babel/env"]
    }))
    .bundle()
    .pipe(source("app.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(plugins.uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest("./app/assets/js/"))
);

// Linters
gulp.task("lint-styles", () =>
  gulp
    .src(["./app/assets/scss/**/*.scss", "!assets/scss/vendor/**/*.scss"])
    .pipe(plugins.sassLint())
    .pipe(plugins.sassLint.format())
    .pipe(plugins.sassLint.failOnError())
);

gulp.task("lint-scripts", () =>
  gulp
    .src(["./app/assets/js/**/*.js", "!node_modules/**"])
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format())
    .pipe(plugins.eslint.failAfterError())
);

// Merge and minify files
gulp.task("concat-styles", () =>
  gulp
    .src(["./app/assets/css/index.css", "./app/assets/css/vendor/**/*.css"])
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.concat("styles.css"))
    .pipe(plugins.minifyCss())
    .pipe(
      plugins.rename({
        suffix: ".min"
      })
    )
    .pipe(
      plugins.autoprefixer({
        browsers: ["last 2 versions"],
        cascade: false
      })
    )
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest("./app/assets/dist/"))
);

gulp.task("concat-js", () =>
  gulp
    .src(["./app/assets/js/index.js", "./app/assets/js/vendor/**/*.js"])
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.concat("bundle.js"))
    .pipe(plugins.uglify())
    .pipe(
      plugins.rename({
        suffix: ".min"
      })
    )
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest("./app/assets/dist/"))
);

// Gulp tasks
gulp.task("watch", ["browser-sync", "njk", "babel"], () => {
  // Watch sass files
  gulp.watch(["./app/assets/scss/**/*.scss", "./app/components/**/*.scss"], ["styles", reload]);

  // Watch js files
  gulp.watch(["./app/assets/es2015/**/*.js", "./app/components/**/*.js"], ["babel", reload]);

  // Watch njk files
  gulp.watch(
    ["./app/pages/**/*.+(html|njk)", "./app/templates/**/*.+(html|njk)"],
    ["njk", reload]
  );
});

gulp.task("build", ["styles", "merge"]); // Compile sass, concat and minify css + js
gulp.task("default", ["watch"]); // Default gulp task
gulp.task("lint", ["lint-styles", "lint-scripts"]); // Lint css + js files
gulp.task("merge", ["concat-styles", "concat-js"]); // Merge & minify css + js
