var gulp = require('gulp');
var livereload = require('gulp-livereload');


gulp.task('reload', function() {
	gulp.src('modules/**/*.js')
	.pipe(livereload());
});


gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('modules/**/*.js', ['reload']);
});