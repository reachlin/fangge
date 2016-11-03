"use strict";

const express = require('express');
const wechat = require('wechat');
const path = require('path');
const bodyParser = require('body-parser');

const config = require('./config');
const utils = require('./utils');

var db_memory_music = {};
var db_memory_play = {};
var app = express();

app.use(express.query());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


app.post("/musiclist", function(req, res) {
  if (req.body) {
      console.log(`---save ${req.body}`);
      db_memory_music[req.body.jukebox] = req.body.songs;
      res.send("0");
  } else {
    res.send("-2");
  }

});

app.get("/musiclist", function(req, res) {
  if (req.query && req.query.key) {
    console.log(`---get music for ${req.query.key}`);
    if (req.query.key in db_memory_music) {
        res.send(db_memory_music[req.query.key]);
    } else {
        res.send("null");
    }
  } else {
    res.send("null");
  }
});

app.get("/music", function(req, res) {
  if (req.query && req.query.key) {
    console.log(`---get music for ${req.query.key}`);
    if (req.query.key in db_memory_play) {
        res.send(`${db_memory_play[req.query.key]}`);
    } else {
        res.send("#STOP");
    }
  } else {
    res.send("#STOP");
  }
});

app.get('/', function (req, res) {
  res.send('Hello World! from reachlin@gmail.com');
});

app.get('/wechat', function (req, res) {
  console.log('/weixin:'+req.ip+','+req.subdomains);
  res.send(200, req.query.echostr);
});

app.use('/wechat', wechat(config.wechat, wechat.text(function (message, req, res) {
  var msg = message.Content;
  var jb = "test";
  if (msg==='help' || msg==='?') {
    res.reply(utils.get_help());
  } else if (msg==='list') {
    if (jb in db_memory_music) {
        console.log(`list for ${jb} ${db_memory_music[jb]}`);
        res.reply(db_memory_music[jb].substring(0,600));
    } else {
        res.reply("empty");
    }
  } else if (msg==='stop') {
    db_memory_play[jb] = "#STOP";
    res.reply("stop");
  } else if (msg==='play') {
    if (jb in db_memory_play) {
        res.reply(`playing song ${db_memory_play[jb]}`);
    } else {
        db_memory_play[jb] = "#STOP";
        res.reply(db_memory_play[jb]);
    }
  } else if(msg.match(/^play\s+\d+/)) {
    var song = msg.match(/\d+/);
    db_memory_play[jb] = song;
    res.reply(`play song ${db_memory_play[jb]}`);
  } else {
    res.reply(utils.get_help());
  }
})));

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
