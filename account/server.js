var querystring = require('querystring');
var http = require('http');
var ddos = require('./ddos');
var log = require('../lib/log');

var routes = require('./routes');
var staticFileHandler = require('./file-handler');

var startServer = function(port) {
  var handler = function(req, res) {
    return buildRequestObject(req, function(requestData) {
      var routeHandler = routes[requestData.key] || staticFileHandler;

      return routeHandler(requestData, function(responseData) {
        return serve(res, responseData);
      });
    });
  };

  var server = http.createServer(handler);

  server.on('connection', ddos.handler);
  server.listen(port);

  log('account', 'listening on ' + port);
};

var buildRequestObject = function(req, callback) {
  var parts = req.url.split('?');

  var requestData = {
    url: parts[0],
    key: req.method + ' ' + parts[0],
    query: querystring.parse(parts[1]),
    body: {}
  };

  if (!requestData.query) {
    requestData.query = {};
  }

  if (req.method !== 'POST') {
    return callback(requestData);
  }

  var jsonString = '';

  req.on('data', function(data) {
    jsonString += data;

    if (jsonString.length > 1e6) {
      jsonString = '{}';
      req.connection.destroy();
    }
  });

  req.on('end', function() {
    try {
      requestData.body = JSON.parse(jsonString);
    } catch (err) {
      requestData.body = {};
    }

    return callback(requestData);
  });
};

var serve = function(res, response) {
  if (response.err) {
    res.statusCode = response.err;
    return res.end();
  }

  if (response.redirect) {
    res.writeHead(302, { location: response.redirect });
    return res.end();
  }

  res.setHeader('Content-Length', response.data.length);
  res.setHeader('Content-Type', response.mime);
  res.statusCode = 200;
  res.end(response.data);
};

module.exports = {
  startServer: startServer
};