var _gulp = require('gulp'),
    _sass = require('gulp-sass')(require('dart-sass')),
    _prefix = require('gulp-autoprefixer'),
    _sourcemaps = require('gulp-sourcemaps'),
    _glob = require('gulp-sass-glob'),
    _config = require('../../config.js');

/**
 * writes the scss files into the public css folder
 * using minifier, autoprefixer and sourcemaps
 *
 * @return {*}
 */
module.exports = function() {
    return _gulp.src(_config().frontend.css.src)
            .pipe(_sourcemaps.init())
            .pipe(_glob())
            .pipe(_sass().on('error', _sass.logError))
            .pipe(_prefix('last 4 version'))
            .pipe(_sourcemaps.write('.'))
            .pipe(_gulp.dest(_config().frontend.css.dest));
};

module.exports.alias = 'Frontend:SCSS';
