var express = require("express");
var bodyParser = require("body-parser");
var http = require("http");
var redis = require("redis");
var Promise = require("promise");

var client = redis.createClient();

client.on("error", function(err) {
  console.log("Error: " + err);
});

var port = 3000;
var wait_time = 10 * 60; // time in seconds until app refreshes ip limits

var app = express();
app.set('port', port);

app.use(bodyParser.json()); // supports JSON encoded bodies
app.use(bodyParser.urlencoded({ // supports URL-encoded bodies
  extended: true
}));

app.use(function(req, res, next) {
  res.header('Content-Type', 'application/json');
  next();
});

function getMaxWithdrawal () {
  return 1300;
}

function getSavedLimit (ip) {
  var promise = new Promise(function(resolve, reject) {
    client.get(ip, function(err, result) {
      // we could connect to redis and make the query
      if (!err) {
        // this IP has visited before, return previously computed limits
        if (result) {
          resolve(result);
        } else { 
          resolve(-1);
        }
      } else {
        reject(err);
      }
    });
  });
  return promise;
}

app.get('/limit', function(req, res) {
  getSavedLimit(req.ip).then(function(limit) {
    var resp = {
      ip: req.ip, 
      max: limit
    }
    // if limit returns -1, we need to set the limit
    if (limit < 0) {
      var max = getMaxWithdrawal();
      client.set(req.ip, max);
      client.expire(req.ip, wait_time);
      resp.max = max;
    }
    return res.end(JSON.stringify(resp));
  });
});

app.post('/', function(req, res) {
  var addr = req.body.addr;
  var sat = req.body.amount;

  // check IP limits
  getSavedLimit(req.ip).then(function(resp) {
    console.log("limit: " + resp + ", ask: " + sat);
    if (resp > sat) {
      // make transaction
      return res.end("WE GOOD");
    } else {
      return res.end(JSON.stringify({
        error: "Request exceeds limit",
        limit: resp,
        request: sat,
        ip: req.ip
      }));
    }
  })
});

http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});
