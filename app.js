var express = require("express");
var bodyParser = require("body-parser");
var http = require("http");

var port = 3000;

var app = express();
app.set('port', port);

app.use(bodyParser.json()); // supports JSON encoded bodies
app.use(bodyParser.urlencoded({ // supports URL-encoded bodies
  extended: true
}));

app.get('/', function(req, res) {
  res.end("cool");
});

app.post('/msg', function(req, res) {
  var message = req.body;
  var msg = JSON.stringify(message);
  console.log(msg);
});

http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});
