module.exports = function(grunt) {

  'use strict';

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({

    root: {
      app: 'app',
      dist: 'dist',
      test: 'test',
      tmp: '.tmp'
    },

    connect: {
      options: {
        port: 8000,
        open: true,
        livereload: 35729,
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function(connect) {
            return [
              connect.static('.tmp'),
              connect().use('/bower_components', connect.static('./bower_components')),
              connect.static('app')
            ];
          }
        }
      },
      test: {
        options: {
          open: false,
          port: 8001,
          middleware: function(connect) {
            return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use('/bower_components', connect.static('./bower_components')),
              connect.static('app')
            ];
          }
        }
      }
    },

    clean: {
      dist: [
        '<%= root.tmp %>',
        '<%= root.dist %>'
      ],
      server: '<%= root.tmp %>'
    },

    bower: {
      install: {
        options: {
          copy: false
        }
      }
    },

    stylus: {
      options: {
        paths: ['./bower_components'],
        use: [
          require('fluidity'),
          function() {
            return require('autoprefixer-stylus')({browsers: 'last 2 versions'});
          }
        ],
        'include css': true,
      },
      server: {
        files: {
          '<%= root.tmp %>/styles/main.css': '<%= root.app %>/styles/main.styl'
        }
      }
    },

    mocha: {
      all: {
        options: {
          run: true,
          urls: ['http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/index.html']
        }
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= root.app %>/scripts/{,*/}{,*/}*.js',
        '<%= root.test %>/specs/{,*/}{,*/}*.js',
        '<%= root.test %>/runner.js'
      ]
    },

    watch: {
      styles: {
        files: [
          '<%= root.app %>/styles/{,*/}{,*/}*.styl'
        ],
        tasks: ['stylus']
      },
      scripts: {
        options: {
          livereload: true
        },
        files: '<%= jshint.all %>',
        tasks: ['jshint']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= root.app %>/{,*/}*.html',
          '<%= root.tmp %>/styles/{,*/}*.css',
          '<%= root.app %>/images/{,*/}*'
        ]
      }
    },

    'gh-pages': {
      options: {
        base: 'dist'
      },
      src: ['**']
    },

    concurrent: {
      server: [
        'stylus'
      ]
    }

  });

  grunt.registerTask('serve', function () {

    grunt.task.run([
      'clean:server',
      'bower',
      'concurrent:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'connect:test',
    'jshint',
    'mocha'
  ]);

  grunt.registerTask('default', [
    'serve'
  ]);

};
