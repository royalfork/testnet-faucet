var express = require("express");
var bodyParser = require("body-parser");
var http = require("http");
var redis = require("redis");
var Promise = require("promise");
var bitcoin = require("bitcoin");
var btcmath = require("bitcoin-math");

var config = require("./config");

// set constants
var port = 3000;
var wait_time = 60 * 60; // time in seconds until app refreshes ip limits

// config redis
var redis_c = redis.createClient();
redis_c.on("error", function(err) {
  console.log("Error: " + err);
});

// config bitcoin
var btc_c = new bitcoin.Client({
  host: 'localhost',
  port: config.bitcoind.port,
  user: config.bitcoind.username,
  pass: config.bitcoind.password,
  timeout: 30000
});

// config app
var app = express();
app.set('port', port);
app.use(bodyParser.json()); // supports JSON encoded bodies
app.use(bodyParser.urlencoded({ // supports URL-encoded bodies
  extended: true
}));

// app will only respond with JSON
app.use(function(req, res, next) {
  res.header('Content-Type', 'application/json');
  next();
});

// 2% of current balance
function getMaxWithdrawal () {
  var PERCENTAGE_OF_BAL = .02;
  var promise = new Promise(function(resolve, reject) {
    btc_c.getBalance('*', 1, function(err, balance, resHeaders) {
      if (err) {
        reject(err);
      }
      resolve(Math.floor(balance.toSatoshi() * PERCENTAGE_OF_BAL));
    });
  })
  return promise;
}

// returns limit for IP from redis
function getSavedLimit (ip) {
  var promise = new Promise(function(resolve, reject) {
    redis_c.get(ip, function(err, result) {
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
      getMaxWithdrawal().then(function(max) {
        redis_c.set(req.ip, max);
        redis_c.expire(req.ip, wait_time);
        resp.max = max;
        return res.end(JSON.stringify(resp));
      });
    } else {
      return res.end(JSON.stringify(resp));
    }
  });
});

app.post('/', function(req, res) {
  var addr = req.body.address;
  var sat = parseInt(req.body.amount);

  // check IP limits
  getSavedLimit(req.ip).then(function(resp) {
    console.log("limit: " + resp + ", ask: " + sat);
    if (resp > sat) {
      // make transaction
      btc_c.cmd("sendtoaddress", addr, sat.toBitcoin(), function(err, txid, headers) {
        console.log(txid);
        if (err) {
          return res.end(JSON.stringify({
            code: err.code,
            message: err.message
          }));
        }

        // we have successfully made a txn
        // update limit, and send new limit and txid 
        redis_c.decrby(req.ip, sat, function(err, result) {
          if (err) {
            return res.end(JSON.stringify({
              error: "Internal Error"
            }));
          }
          return res.end(JSON.stringify({
            id: txid,
            limit: result
          }));
        });

      });
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
