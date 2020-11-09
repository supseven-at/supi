var _gulp = require('gulp'),
    _rename = require('gulp-rename'),
    _uglify = require('gulp-uglify'),
    _ts = require('gulp-typescript'),
    _config = require('../../config.js');

/**
 * writes the javascript files into the public javascript folder
 * using minifier and sourcemaps
 *
 * @return {*}
 */
module.exports = function() {
    return _gulp.src([
            _config().frontend.javascript.src
        ])
        .pipe(_ts({
            outFile: _config().frontend.javascript.outFile
        }))
        .pipe(_rename({ suffix: '.min' }))
        .pipe(_uglify())
        .pipe(_gulp.dest(_config().frontend.javascript.dest));
};

module.exports.alias = 'Frontend:JS';
