var   gulp  = require('gulp')
	, m     = require('mocha')
	, mocha = require('gulp-mocha')
    // prevents gulp-typescript from not found lib.d.ts
    // as it uses a dirty hack to find it based on requires.cache
    // not suitable for mocha tests
    , typescript = require('typescript');
	

gulp.task('default', function () {
    return gulp.src('./test/index.spec.js', {read: false})
        .pipe(mocha({reporter: 'nyan'}));
});

gulp.task('watch-mocha', function() {
    gulp.watch(['test/**'], ['default']);
});