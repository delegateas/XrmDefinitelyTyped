var gulp = require("gulp");
var del = require("del");
var rename = require("gulp-rename");
var concat = require('gulp-concat');
var merge = require('merge2');

var uglify = require("gulp-uglify");

var ts = require("gulp-typescript");
var eslint = require("gulp-eslint");
var tsProject = ts.createProject("tsconfig.json");

var outDir = tsProject.options.outDir;

function clean() {
    return del(outDir);
}

function runUglify() {
    return gulp.src(outDir + '/*.js')
        .pipe(uglify({ mangle: true }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(outDir));
}

function compile_ts(){
    var result = tsProject.src()
        .pipe(tsProject());

    return merge([
        result.js.pipe(gulp.dest(outDir)),
        result.dts.pipe(gulp.dest(outDir))
    ]);
}

function runEsLint() {
    return gulp.src("**/*.ts")
        .pipe(eslint.format());
}

function concat_promise() {
    return gulp.src(
        [
            outDir + "/../es6-promise.auto.min.js",
            outDir + "/dg.xrmquery.web.js"
        ])
        .pipe(concat("dg.xrmquery.web.promise.js"))
        .pipe(gulp.dest(outDir));
}


// Run tasks in series
gulp.task("default", gulp.series(
    clean,
    compile_ts,
    runEsLint,
    concat_promise,
    runUglify));

gulp.task("build-Debug", gulp.series('default'));
gulp.task("build-Release", gulp.series('default'));