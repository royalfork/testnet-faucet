var express = require("express");
var bodyParser = require("body-parser");
var http = require("http");
var redis = require("redis");

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

app.get('/limit', function(req, res) {
  client.get(req.ip, function(err, result) {
    // we could connect to redis and make the query
    if (!err) {
      // this IP has visited before, return previously computed limits
      if (result) {
        var resp = {
          max: result,
          ip: req.ip
        };
        return res.end(JSON.stringify(resp));
      } else { 
        // first time IP has visited
        // compute current limit, respond with default wait time
        var max = getMaxWithdrawal();
        client.set(req.ip, max);
        client.expire(req.ip, wait_time);

        var resp = {
          max: max, 
          ip: req.ip
        };
        return res.end(JSON.stringify(resp));
      }
    }
    return res.end(JSON.stringify({error: "There was an internal error"}));
  });
});

app.get('/', function(req, res) {
  // get redis val for ip 
  console.log(req.ip);
  client.get(req.ip, function(err, result) {
    if (!err) {
      if (result) {
        return res.end(result);
      }
      client.set(req.ip, 1000);
      return res.end("no entry for your ip");
    }
    console.log("Error: " + JSON.stringify(err));
    return res.end("WE HAVE ERROR");
  })
});

app.post('/msg', function(req, res) {
  var message = req.body;
  var msg = JSON.stringify(message);
  console.log(msg);
});

http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});
