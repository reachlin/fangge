"use strict";

const express = require('express');
const wechat = require('wechat');
const path = require('path');
const redis = require('redis');
const bodyParser = require('body-parser');

const config = require('./config');
const utils = require('./utils');

var db_memory_music = {};
var db_memory_play = {};
var app = express();

app.set('view engine', 'jade');
app.set('views', 'views');
app.use(express.query());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


var dbclient = redis.createClient(6379, "redis");

dbclient.on('connect', function() {
  console.log('redis connected');
});

app.post("/musiclist", function(req, res) {
  if (req.body) {
    console.log(`---save ${req.body}`);
    dbclient.hset(req.body.jukebox, "play", req.body.info, function(err, msg) {
      console.log(`--play ${err}, ${msg}`);
    });
    dbclient.hset(req.body.jukebox, "jukebox", req.body.info, function(err, msg) {
      console.log(`--jukebox ${err}, ${msg}`);
    });
    dbclient.hset(req.body.jukebox, "music", req.body.songs, function(err, msg) {
      if (err) {
        res.send("-1");
      } else {
        res.send("0");
      }
    });
  } else {
    res.send("-2");
  }
});

app.get("/musiclist", function(req, res) {
  if (req.query && req.query.key) {
    console.log(`---get music for ${req.query.key}`);
    dbclient.hget(req.query.key, "cmd", function(err, msg) {
      if (err) {
        res.render('wechat_msg', {"title":"ERROR", "msg":`${err}`});
      } else {
        res.render('wechat_list', {"title":"Song List", "items":msg});
      }
    });
  } else {
    res.render('wechat_msg', {"title":"ERROR", "msg":"missing query parameter"});
  }
});

app.get("/music", function(req, res) {
  if (req.query && req.query.key) {
    console.log(`---get music for ${req.query.key}`);
    dbclient.hget(req.query.key, "play", function(err, msg) {
      if (err) {
        console.log(`---Error: get music for ${req.query.key} ${err}`);
        res.send("#STOP");
      } else {
        res.send(msg);
      }
    });
  } else {
    console.log(`---Error: get music for ${req.query.key} empty`);
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
    res.reply([
      {
        title: 'Music List',
        description: 'Select the number of a song to play.',
        url: 'http://www.bookxclub.com/musiclist?key='+jb
      }
    ]);
  } else if (msg==='stop') {
    dbclient.hset(jb, "play", "#STOP", function(err, msg) {
      if (err) {
        res.reply(`${jb}: Cant stop the music.`);
      } else {
        res.reply(`${jb}: Music stopped.`);
      }
    });
  } else if (msg==='play') {
    dbclient.hget(jb, "play", function(err, msg) {
      if (err) {
        res.reply(`${jb}: Error!`);
      } else {
        if (msg) {
          if (msg==='#STOP') {
            res.reply(`${jb}: Stopped.`);
          } else {
            res.reply(`${jb}: msg`);
          }
        } else {
          res.reply(`${jb}: Idle...`);
        }
      }
    });
  } else if(msg.match(/^play\s+\d+/)) {
    var song = msg.match(/\d+/);
    dbclient.hset(jb, "play", song, function(err, msg) {
      if (err) {
        res.reply(`${jb}: Cant play the song ${song}`);
      } else {
        res.reply(`${jb}: Playing song ${song}...`);
      }
    });
  } else {
    res.reply(utils.get_help());
  }
})));

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
