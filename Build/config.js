/**
 * this is the main config file for
 * paths and more you can use in
 * the gulp-tasks
 *
 * @return {{ext: *, frontend: {css: {src: string, watch: string, dest: string}, javascript: {src: string, watch: string, dest: string}}}}
 *
 */
module.exports = function () {
    var ext = __dirname.substring(0, __dirname.indexOf('supi')) + 'supi';

    return {
        ext: ext,
        frontend: {
            css: {
                src: ext + '/Build/Src/Scss/Supi.scss',
                dest: ext + '/Resources/Public/Css',
                watch: ext + '/Build/Src/Scss/**/*.scss'
            },
            javascript: {
                src: ext + '/Build/Src/JavaScript/**/*.ts',
                dest: ext + '/Resources/Public/JavaScript',
                outFile: 'Supi.js',
                watch: ext + '/Build/Src/JavaScript/**/*.ts'
            },
        }
    };
};
