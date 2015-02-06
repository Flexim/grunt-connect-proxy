/*
 * grunt-connect-proxy
 * https://github.com/drewzboto/grunt-connect-proxy
 *
 * Copyright (c) 2013 Drewz
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var proxySnippet = require("./lib/utils.js").proxyRequest;

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        'lib/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    connect: {
      options: {
          port: 9000,
          // change this to '0.0.0.0' to access the server from outside
          hostname: 'localhost'
      },
      proxies:
      [
            {
              context: '/defaults',
              host: 'www.defaults.com'
            },
            {
              context: '/full',
              host: 'www.full.com',
              port: 8080,
              https: true,
              xforward: true,
              rewrite: {
                '^/full': '/anothercontext'
              },
              headers: {
                "X-Proxied-Header": "added"
              },
              ws: true
            },
            {
              context: '/context/test',
              host: 'www.anothercontext.com',
              rewrite: {
                '^/context': '/anothercontext',
                'test': 'testing'
              }
            },
            {
              context: '/invalidrewrite',
              host: 'www.invalidrewrite.com',
              rewrite: {
                '^/undefined': undefined,
                '^/notstring': 13,
                '^/in': '/thisis'
              }
            },
            {
              context: '/missinghost'
            },
            {
              host: 'www.missingcontext.com'
            },
            {
              context: ['/array1','/array2'],
              host: 'www.defaults.com'
            }
      ],
      server2: {
        proxies: [
          {
            context: '/',
            host: 'www.server2.com'
          }
        ]
      },
      server3: {
        appendProxies: false,
        proxies: [
          {
            context: '/server3',
            host: 'www.server3.com',
            port: 8080,
          }
        ]
      },
      request: {
        options: {
          middleware: function (connect, options) {
            return [require('./lib/utils').proxyRequest];
          }
        },
        proxies: [
          {
            context: '/request',
            host: 'localhost',
            port: 8080,
            headers: {
              "x-proxied-header": "added"
            }
          }
        ]
      },
      wsrequest: {
        options: {
          port: 8082,
          middleware: function (connect, options) {
            return [require('./lib/utils').proxyRequest];
          }
        },
        proxies: [
          {
            context: '/ws',
            host: 'localhost',
            port: 8090,
            ws: true,
            https: false
          }
        ]
      }
    },

    // Unit tests.
    nodeunit: {
      tests: 'test/connect_proxy_test.js',
      server2: 'test/server2_proxy_test.js',
      server3: 'test/server3_proxy_test.js',
      utils: 'test/utils_test.js',
      request: 'test/request_test.js',
      wsrequest: 'test/ws_request_test.js'
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', [
    'clean',
    'nodeunit:utils',
    'configureProxies',
    'nodeunit:tests',
    'configureProxies:server2',
    'nodeunit:server2',
    'configureProxies:server3',
    'nodeunit:server3',
    'configureProxies:request',
    'connect:request',
    'nodeunit:request',
    'configureProxies:wsrequest',
    'connect:wsrequest',
    'nodeunit:wsrequest'
    ]);

  // specifically test that option inheritance works for multi-level config
  grunt.registerTask('test-inheritance', [
    'clean',
    'configureProxies:server2',
    'nodeunit:server2'
  ]);


  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
