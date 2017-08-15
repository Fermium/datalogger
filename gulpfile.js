var gulp = require('gulp');
var typedoc = require("gulp-typedoc");
gulp.task("typedoc", function() {
    return gulp
        .src(["app/**/*.ts"])
        .pipe(typedoc({
          ignoreCompilerErrors: true,
            module: "commonjs",
            target: "es5",
            out: "_docs/",
            name: "Datalogger",

        }))
    ;
});
