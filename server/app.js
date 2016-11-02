var express = require('express');
var wechat = require('wechat');
var path = require('path');

var config = require('./config');
var utils = require('./utils');

var app = express();

app.use(express.query());
app.use(express.bodyParser({uploadDir:'./uploads'}));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function (req, res) {
  res.send('Hello World! from reachlin@gmail.com');
});

app.get('/wechat', function (req, res) {
  console.log('/weixin:'+req.ip+','+req.subdomains);
  res.send(200, req.query.echostr);
});

app.use('/wechat', wechat(config.wechat, wechat.text(function (message, req, res) {
  var msg = message.Content;
  if (msg==='help' || msg==='?') {
    res.reply(utils.get_help());
  } else {
    res.reply(utils.get_help());
  }
})));

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});