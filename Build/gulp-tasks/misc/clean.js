var _config = require('../../config.js'),
    _del = require('del'),
    _folderAndFiles = [_config().frontend.css.dest, _config().frontend.javascript.dest];

/**
 * sets up a browser sync for more fancy development
 * reloads on js changes, injects reloaded css after build
 * more options are found in the desired backend:port url
 *
 * @return {*}
 */
module.exports = function () {
    return _del(_folderAndFiles, { force: true });
};

module.exports.alias = 'Misc:CLEAN';
