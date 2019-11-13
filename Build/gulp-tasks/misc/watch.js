var _gulp = require('gulp'),
    _config = require('../../config.js');

/**
 * sets up a browser sync for more fancy development
 * reloads on js changes, injects reloaded css after build
 * more options are found in the desired backend:port url
 *
 * @return {*}
 */
module.exports = function(done) {
    done();

    _gulp.watch(_config().frontend.css.watch, _gulp.series('Frontend:SCSS'));
    _gulp.watch(_config().frontend.javascript.watch, _gulp.series('Frontend:JS'));
};

module.exports.alias = 'Misc:WATCH';
