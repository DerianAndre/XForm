const gulp = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const header = require('gulp-header');

const today = new Date().toLocaleDateString();
const pkg = require('./package.json');
const banner = [
	'/*!',
	' * XForm',
	' * <%= pkg.description %>',
	' * @version    : <%= pkg.version %>',
	' * @author     : <%= pkg.author %>',
	' * @repository : <%= pkg.repository.url %>',
	' * @built      : <%= today %>',
	' * @license    : <%= pkg.license %>',
	' */',
	''
].join('\n');

gulp.task('build', function (done) {
	// Gulp it!
	gulp.src('./src/*.js')
		// Unminified
		.pipe(header(banner, { pkg : pkg, today: today } ))
		.pipe(rename("xform.js"))
		.pipe(gulp.dest('./dist'))
		.on('end', function(){ 
			console.log(`[${today}] [Gulp] XForm Build - Unminified \t✅`); 
			done();
		})
		// Minified
		.pipe(uglify({
			mangle: {
				toplevel: true
			},
			compress: {
				sequences:    true,
				dead_code:    true,
				conditionals: true,
				booleans:     true,
				unused:       true,
				if_return:    true,
				join_vars:    true,
				drop_console: false
			}
		}))
		.pipe(header(banner, { pkg : pkg, today: today } ))
		.pipe(rename("xform.min.js"))
		.pipe(gulp.dest('./dist'))
		.on('end', function(){ 
			console.log(`[${today}] [Gulp] XForm Build - Minified \t✅`); 
			done();
		});
});

gulp.watch('./src/*.js', gulp.series('build'))

gulp.task('default', gulp.series('build'));