var gulp = require("gulp");
var del = require("del");
var runSequence = require('run-sequence');
var rename = require("gulp-rename");
var concat = require('gulp-concat');
var merge = require('merge2');

var uglify = require("gulp-uglify");

var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

var outDir = tsProject.options.outDir


gulp.task("clean", function () {
    return del(outDir);
});

gulp.task("uglify", function () {
    return gulp.src(outDir + '/*.js')
        .pipe(uglify({ mangle: true }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(outDir));
});

gulp.task("compile-ts", function () {
    var result = tsProject.src()
        .pipe(tsProject());

    return merge([
       result.js.pipe(gulp.dest(outDir)),
       result.dts.pipe(gulp.dest(outDir))
    ]);
        
});

gulp.task("concat-promise", function () {
    return gulp.src(
        [
            outDir + "/../es6-promise.auto.min.js",
            outDir + "/dg.xrmquery.web.js"
        ])
        .pipe(concat("dg.xrmquery.web.promise.js"))
        .pipe(gulp.dest(outDir));
});


// Run tasks in sequence
gulp.task('default', function (cb) {
    runSequence(
        'clean',
        'compile-ts',
        'concat-promise',
        'uglify',
        cb
    );
});

gulp.task("build-Debug", ["default"]);
gulp.task("build-Release", ["default"]);