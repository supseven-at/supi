var _gulp = require('gulp'),
    _glass = require('@agostone/gulp-glass'),
    _taskLoader = new _glass({
        taskPaths: 'gulp-tasks'
    });

_taskLoader.loadTasks();

_gulp.task('default', _gulp.series('Misc:CLEAN',_gulp.parallel('Frontend:SCSS', 'Frontend:JS')));
_gulp.task('watch', _gulp.series('default', 'Misc:WATCH'));
