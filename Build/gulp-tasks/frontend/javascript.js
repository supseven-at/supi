var _gulp = require('gulp'),
    _webpack = require('webpack'),
    _gulpWebpack = require('webpack-stream'),
    _named = require('vinyl-named'),
    _config = require('../../config.js'),
    _rename = require('gulp-rename');

/**
 * writes the javascript files into the public javascript folder
 * using minifier and sourcemaps
 *
 * @return {*}
 */
module.exports = function () {
    return _gulp
        .src([_config().frontend.javascript.src])
        .pipe(_named())
        .pipe(
            _gulpWebpack(
                {
                    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
                    target: ['web', 'es5'],
                    devtool: 'source-map',
                    module: {
                        rules: [
                            {
                                test: /\.tsx?$/,
                                use: 'ts-loader',
                                exclude: /node_modules/,
                            },
                        ],
                    },
                    resolve: {
                        extensions: ['.ts', '.tsx', '.js'],
                    },
                },
                _webpack
            )
        )
        .pipe(
            _rename(function (path) {
                path.basename = 'Supi';
            })
        )
        .pipe(_gulp.dest(_config().frontend.javascript.dest));
};

module.exports.alias = 'Frontend:JS';
