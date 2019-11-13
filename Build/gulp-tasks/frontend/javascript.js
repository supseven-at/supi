var _gulp = require('gulp'),
    _rename = require('gulp-rename'),
    _concat = require('gulp-concat'),
    _uglify = require('gulp-uglify'),
    _sourcemaps = require('gulp-sourcemaps'),
    _config = require('../../config.js');

/**
 * writes the javascript files into the public javascript folder
 * using minifier and sourcemaps
 *
 * @return {*}
 */
module.exports = function(done) {
    done();

    return _gulp.src([
        _config().frontend.javascript.src
    ])
        .pipe(_sourcemaps.init())
        .pipe(_concat('Supi.js'))
        .pipe(_rename({ suffix: '.min' }))
        .pipe(_uglify())
        .pipe(_sourcemaps.write('.'))
        .pipe(_gulp.dest(_config().frontend.javascript.dest));
};

module.exports.alias = 'Frontend:JS';