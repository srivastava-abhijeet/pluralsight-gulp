/**
 * Created by asriv10 on 2/11/17.
 */

module.exports = function() {

    var config = {

        temp: './.tmp/',

        /**
         *  File path
         */

        less: './src/client/styles/styles.less',

        // all js to vet
        alljs: ['./src/**/*.js','./*.js'],

        index: './src/client/index.html',

        css: './.tmp/*.css',

        js: ['./src/client/app/**/*.module.js',
             './src/client/app/**/*.js',
             '!./src/client/app/**/*.spec.js'],

        client: './src/client/',

        server: './src/server/',

        /**
         *  Browsr sync
         */
        browserReloadDelay: 1000,

        /**
         *  Bower and NPM locations
         */

        bower : {

            json: require('./bower.json'),
            directory: './bower_components',
            ignorePath: '../..'

        },

        /**
         *  Node settings
         */

        defaultPort:  7203,
        nodeServer: './src/server/app.js',

        /**
         *
         * @returns {{bowerJson, directory: (*|boolean|string), ignorePath: (*|Array|string|string)}}
         */

        getWiredepDefaultOptions: function() {

            var options = {

                bowerJson: config.bower.json,
                directory: config.bower.directory,
                ignorePath: config.bower.ignorePath
            };

            return options;

        }
    };

    return config;
};
