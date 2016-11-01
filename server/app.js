var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World! from reachlin@gmail.com');
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});