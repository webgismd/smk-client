module.exports = function( grunt ) {

    var jshintStylish = require( 'jshint-stylish' )

    jshintStylish.reporter = ( function ( inner ) {
        return function ( result, config ) {
            return inner( result, config, { verbose: true } )
        }
    } )( jshintStylish.reporter )


    grunt.initConfig( {
        package: grunt.file.readJSON( 'package.json' ),

        srcPath: 'src',
        examplePath: 'example',

        buildPath: 'build',

        serverHost: 'localhost',

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        copy: {
            'root': {
                expand: true,
                cwd: '<%= srcPath %>',
                src: [ 'index.html', 'map-config.json', 'readme.md' ],
                dest: '<%= buildPath %>',
                options: {
                    process: '<%= processTemplate %>',
                },
            },

            'images': {
                expand: true,
                cwd: '<%= srcPath %>/smk',
                src: [ '**/*.{gif,png,jpg,jpeg}' ],
                dest: '<%= buildPath %>/images'
            },

            'example-data': {
                expand: true,
                cwd: '<%= examplePath %>',
                src: [ 'attachments/**', 'config/**' ],
                dest: '<%= buildPath %>'
            },

            'examples': {
                expand: true,
                cwd: '<%= examplePath %>',
                src: [ '**', '!attachments/**', '!config/**' ],
                dest: '<%= buildPath %>/example'
            },

            'themes': {
                expand: true,
                cwd: '<%= srcPath %>/theme',
                src: [ '**' ],
                dest: '<%= buildPath %>/theme'
            },

            'deploy': {}
        },

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        clean: {
            options: {
                force: true
            },

            all: {
                src: [ '<%= buildPath %>/**' ]
            },

            'build': {
                src: [ '<%= buildPath %>/**', '!<%= buildPath %>', '!<%= buildPath %>/attachments/**', '!<%= buildPath %>/config/**' ]
            },

            'example-data': {
                src: [ '<%= buildPath %>/attachments/**', '<%= buildPath %>/config/**' ]
            },

            temp: {
                src: [ '<%= buildPath %>/smk-tags-*.js' ]
            }
        },

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        jshint: {
            options: {
                reporter: jshintStylish,
                // reporter: 'checkstyle',

                // unused: true,
                // latedef: true,
                // curly: true,
                // eqeqeq: true,
                bitwise: true,
                strict: true,
                undef: true,
                asi: true,
                plusplus: true,
                eqnull: true,
                multistr: true,
                sub: true,
                browser: true,
                devel: true,

                '-W018': true, // confusing use of !

                globals: {
                    SMK: true,
                    $: true,
                    Vue: true,
                    console: true,
                    Promise: true,
                    include: true,
                    require: true,
                    turf: true,
                    Terraformer: true,
                    proj4: true,
                    L: true,
                },
            },
            lib: [ '<%= srcPath %>/smk/**/*js', '!<%= srcPath %>/smk/**/lib/**', '!<%= srcPath %>/smk/**/*.min.js' ],
            smk: [ '<%= buildPath %>/smk.js' ],
        },

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        zip: {
            dev: {
                expand: true,
                dest: '<%= buildPath %>/smk-<%= pom.project.version %>-development.zip',
                src: [ './**/*', '!./build/**', '!./etc/**', '!./node*/**', '!./target/**' ]
            }
        },

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        watch: {
            options: {
                debounceDelay: 2000,
                livereload: {
                    host:   '<%= serverHost %>',
                    key:    grunt.file.read( 'node_modules/grunt-contrib-connect/tasks/certs/server.key' ),
                    cert:   grunt.file.read( 'node_modules/grunt-contrib-connect/tasks/certs/server.crt' )
                },
                livereloadOnError: false,
                spawn: false
                // interrupt: true,
            },

            src: {
                files: [ '<%= srcPath %>/**', 'smk-tags.js', 'lib/**' ],
                tasks: [ 'build' ]
            },

            test: {
                files: [ '<%= examplePath %>/**' ],
                tasks: [ 'build-examples', 'build-example-data' ]
            }
        }

    } )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    require( 'load-grunt-tasks' )( grunt )

    grunt.loadTasks( 'tasks' )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    grunt.registerTask( 'develop', [
        'clean:all',
        'build',
        'build-example-data',
        'connect',
        'watch'
    ] )

    grunt.registerTask( 'build', [
        'clean:build',
        'build-info',
        'build-lib',
        'build-images',
        'build-themes',
        'build-smk',
        'build-examples',
        'build-root',
        'clean:temp',
    ] )

    grunt.registerTask( 'write-tag-head-foot', function () {
        var fn = grunt.template.process( '<%= buildPath %>/smk-tags-head.js' )
        grunt.file.write( fn, 'if ( !window.include.SMK ) { ( function () {\n"use strict";\n' )

        var fn = grunt.template.process( '<%= buildPath %>/smk-tags-foot.js' )
        grunt.file.write( fn, '\nwindow.include.SMK = true\n} )() }\n' )
    } )

    grunt.registerTask( 'build-smk', function () {
        grunt.fail.fatal( 'Build mode isn\'t set' )
    } )

    grunt.registerTask( 'build-lib', function () {
        grunt.fail.fatal( 'Build mode isn\'t set' )
    } )

    grunt.registerTask( 'build-images', [
        'copy:images',
    ] )

    grunt.registerTask( 'build-themes', [
        'copy:themes',
    ] )

    grunt.registerTask( 'build-examples', [
        'copy:examples',
    ] )

    grunt.registerTask( 'build-example-data', [
        'clean:example-data',
        'copy:example-data',
    ] )

    grunt.registerTask( 'build-root', [
        'copy:root',
    ] )

    grunt.registerTask( 'build-dev-kit', [
        'zip:dev',
    ] )
 
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    grunt.registerTask( 'default', [
        'mode:dev',
        'use:https',
        'develop'
    ] )

    grunt.registerTask( 'maven', [
        'mode:release',
        'clean:all',
        'build',
        'build-dev-kit'
    ] )

}