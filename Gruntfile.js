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

    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= root.app %>',
          dest: '<%= root.dist %>',
          src: [
            '*.{ico,png,txt}',
            '{,*/}*.html'
          ]
        }]
      }
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
      compile: {
        files: {
          '<%= root.tmp %>/styles/main.css': '<%= root.app %>/styles/main.styl'
        }
      }
    },

    cssmin: {
      dist: {
        files: {
          '<%= root.dist %>/styles/main.css': [
            './bower_components/normalize-css/normalize.css',
            './bower_components/selectize/dist/css/selectize.css',
            '<%= root.tmp %>/styles/{,*/}*.css'
          ]
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

    requirejs: {
      compile: {
        options: {
          almond: true,
          wrap: true,
          useStrict: true,
          removeCombined: true,
          baseUrl: './',
          mainConfigFile: '<%= root.app %>/scripts/main.js',
          replaceRequireScript: [{
            files: ['<%= root.dist %>/index.html'],
            module: 'main'
          }],
          modules: [{name: 'main'}],
          appDir: '<%= root.app %>/scripts/',
          dir: '<%= root.dist %>/scripts/',
        }
      }
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= root.app %>/images/',
          src: ['**/*.{png,jpg,gif}'],
          dest: '<%= root.dist %>/images/'
        }]
      }
    },

    useminPrepare: {
      options: {
        dest: '<%= root.dist %>',
        flow: {
          html: {
            steps: { js: [], css: [] },
            post: {}
          }
        }
      },
      html: '<%= root.app %>/index.html'
    },

    usemin: {
      options: {
        assetsDirs: ['<%= root.dist %>', '<%= root.dist %>/images']
      },
      html: ['<%= root.dist %>/{,*/}*.html'],
      css: ['<%= root.dist %>/styles/{,*/}*.css']
    },

    htmlmin: {
      dist: {
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeAttributeQuotes: true,
          removeCommentsFromCDATA: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true,
          removeRedundantAttributes: true,
          useShortDoctype: true
        },
        files: [{
          expand: true,
          cwd: '<%= root.dist %>',
          src: '{,*/}*.html',
          dest: '<%= root.dist %>'
        }]
      }
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

  grunt.registerTask('server', [
    'clean:server',
    'bower',
    'concurrent:server',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('test', [
    'connect:test',
    'jshint',
    'mocha'
  ]);

  grunt.registerTask('default', [
    'serve'
  ]);

  grunt.registerTask('build', [
    'test',
    'clean:dist',
    'bower',
    'useminPrepare',
    'copy:dist',
    'stylus',
    'cssmin',
    'imagemin',
    'requirejs',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('deploy', [
    'build',
    'gh-pages'
  ]);

};
