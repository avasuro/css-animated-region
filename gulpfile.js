/* eslint global-require: "off" */
/* eslint import/no-dynamic-require: "off" */
/*
 |--------------------------------------------------------------------------
 | Modules
 |--------------------------------------------------------------------------
 |
 */
const gulp = require('gulp-group')(require('gulp'));
const mod = {
    path: require('path'),
    babel: require('gulp-babel'),
    rename: require('gulp-rename')
};

/*
 |--------------------------------------------------------------------------
 | Folders, used in project
 |--------------------------------------------------------------------------
 |
 */
const dir = {
    build: mod.path.join(__dirname, 'build'),
    src: mod.path.join(__dirname, 'src')
};

/*
 |--------------------------------------------------------------------------
 | Tasks
 |--------------------------------------------------------------------------
 |
 */

gulp.group('build', () => {
    gulp.task('dev', () => {
        gulp.src(mod.path.join(dir.src, 'index.js'))
            .pipe(mod.babel())
            .pipe(mod.rename('marionette-css-animated-region.js'))
            .pipe(gulp.dest(dir.build));
    });
});