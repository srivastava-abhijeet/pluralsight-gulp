/**
 * Created by asriv10 on 2/11/17.
 */

var gulp = require('gulp');
var args = require('yargs').argv;
var $ = require('gulp-load-plugins')({lazy:true});
var del = require('del');
var config = require('./gulp.config')();
var port = process.env.PORT || config.defaultPort;
var browserSync = require('browser-sync');

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

gulp.task('vet',function() {

    log('Analyzing source with jshint and jscs');

    return gulp
        .src(config.alljs)
        .pipe($.if(args.verbose, $.print()))
        .pipe($.jscs())
        .pipe($.jscs.reporter())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish',{verbose : true}))
        .pipe($.jshint.reporter('fail'));  // 'fail' task can be added for jscs as well.

});

gulp.task('styles', ['clean-styles'], function() {

    log('Compiling Less --> CSS');
    return gulp
        .src(config.less)
        .pipe($.plumber())
        .pipe($.less())
        .pipe($.autoprefixer({browsers : ['last 2 version', '> 5%']}))
        .pipe(gulp.dest(config.temp));

});

gulp.task('clean-styles', function() {

    var files = config.temp + '**/*.css';
    clean(files);

});

gulp.task('less-watcher', function() {

    gulp.watch([config.less], ['styles']);

});

gulp.task('wiredep', function() {

    log('wire up bower css and js and app js into the index.html');

    var wiredep = require('wiredep').stream;
    var options = config.getWiredepDefaultOptions();

    return gulp
        .src(config.index)
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(config.js)))
        .pipe(gulp.dest(config.client));

});

gulp.task('inject', ['wiredep', 'styles'] ,function() {

    log('wire up app css into the index.html and call wiredep');

    return gulp
        .src(config.index)
        .pipe($.inject(gulp.src(config.css)))
        .pipe(gulp.dest(config.client));

});

gulp.task('serve-dev', ['inject'], function() {

    var isDev = true;

    var nodeOptions = {

        script: config.nodeServer,
        delayTime: 1,
        env: {

            'PORT': port,
            'NODE_ENV': isDev ? 'dev' : 'build'
        },
        watch: [config.server]

    };

    return $.nodemon(nodeOptions)
        .on('restart', function(ev) {

            log('*** nodemon restarted ***');
            log('files changed on restart:\n' + ev);

            setTimeout(function() {

                browserSync.notify('Reloading now ...');
                browserSync.reload({stream: false});

            }, config.browserReloadDelay);
        })
        .on('start', function() {

            log('*** nodemon started ***');
            startBrowserSync();

        })
        .on('crash', function() {

            log('*** nodemon crashed: script crashed for some reason ***');

        })
        .on('exit', function() {

            log('*** nodemon exited cleanly ***');

        });

});

function changeEvent(event) {

    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    log('File ' + event.path.replace(srcPattern, '') + '' + event.type);

}

function startBrowserSync() {

    if (args.nosync || browserSync.active) {
        return;
    }

    log('Starting browser-sync on port ' + port);

    gulp.watch([config.less], ['styles'])
        .on('change', function(event) { changeEvent(event); });

    var options = {

        proxy : 'localhost:' + port,
        port: 3000,
        files: [

            config.client + '**/*.*',
            '!' + config.less,
             config.temp + '**/*.css'
        ],
        ghostMode: {

            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },

        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 1000
    };

    browserSync(options);

}

function clean(path) {

    log('Cleaning: ' + path);
    del(path);

}

function log(msg) {

    if (typeof(msg) === 'object') {

        for (var item in msg) {

            if (msg.hasOwnProperty(item)) {

                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    }
    else {

        $.util.log($.util.colors.blue(msg));
    }

}
