'use strict';

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/
var utils = require("../lib/utils.js");
var WebSocket = require('ws');
var WebSocketServer = WebSocket.Server;

exports.connect_proxy = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  proxied_request: function(test) {
    test.expect(1);

    // set up websocket server behind proxy
    var wss = new WebSocketServer({port: 8090});
    wss.on('connection', function(ws) {
      console.log('Server connection open');
      ws.on('message', function(message) {
        console.log('Server got: %s', message);
        ws.send(message);
      });
    });

    // create client and make request to proxy
    var wsc = new WebSocket('ws://localhost:8082/ws');
    wsc.on('message', function(message) {
      console.log('Client received: %s', message);
      test.equal(message, 'something', 'should get something back');
      test.done();
    });
    wsc.on('open', function() {
      console.log('WS open! Sending: something');
      wsc.send('something');
    });

  }
};
