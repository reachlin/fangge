"use strict";

const express = require('express');
const wechat = require('wechat');
const path = require('path');
const redis = require('redis');
const bodyParser = require('body-parser');

const config = require('./config');
const utils = require('./utils');

var app = express();
var user_jb = {};

app.set('view engine', 'pug');
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

app.get("/playsong", function(req, res) {
    if (req.query && req.query.jukebox && req.query.song) {
        dbclient.hset(req.query.jukebox, "play", req.query.song, function(err, msg) {
          if (err) {
            res.render('wechat_msg', {"title":"INFO", "msg":"点歌失败"});
          } else {
            res.render('wechat_msg', {"title":"INFO", "msg":`点歌[${req.query.song}]成功，将在当前歌曲结束后播放。`});
          }
        });
    } else {
        res.render('wechat_msg', {"title":"ERROR", "msg":"missing query parameter"});
    }
});

app.post("/musiclist", function(req, res) {
  if (req.body) {
    console.log(`---save ${req.body}`);
    dbclient.hset(req.body.jukebox, "play", "#STOP", function(err, msg) {
      console.log(`--play ${err}, ${msg}`);
    });
    dbclient.hset("jukebox", req.body.jukebox, req.body.info, function(err, msg) {
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

app.get("/jblist", function(req, res) {
  if (req.query && req.query.user && req.query.token) {
    dbclient.hgetall("jukebox", function(err, msg) {
      if (err) {
        res.render('wechat_msg', {"title":"ERROR", "msg":`${err}`});
      } else {
        if (msg) {
          res.render('wechat_jb_list', {"title":"点唱机", "items": msg, "token": req.query.token, "user": req.query.user});
        } else {
          res.render('wechat_msg', {"title":"错误", "msg":"无点唱机"});
        }
      }
    });
  } else {
    res.render('wechat_msg', {"title":"ERROR", "msg":"missing query parameter"});
  }
});

app.get("/musiclist", function(req, res) {
  if (req.query && req.query.key && req.query.user && req.query.token) {
    console.log(`---get music for ${req.query.key}`);
    dbclient.hgetall(req.query.key, function(err, msg) {
      if (err) {
        res.render('wechat_msg', {"title":"ERROR", "msg":`${err}`});
      } else {
        if (msg) {
            var songs = msg["music"].split('\n');
            var current_song = msg["play"]
            res.render('wechat_song_list', {"title":"歌单", "items": songs, "jukebox": req.query.key, "current": current_song, "token": req.query.token, "user": req.query.user});
        } else {
            res.render('wechat_msg', {"title":"错误", "msg":"无此点唱机"});
        }
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
  res.render('wechat_home');
});

app.get('/wechat', function (req, res) {
  console.log('/weixin:'+req.ip+','+req.subdomains);
  res.send(200, req.query.echostr);
});

app.use('/wechat', wechat(config.wechat, wechat.text(function (message, req, res) {
  var msg = message.Content;
  var user = message.FromUserName;
  var token = 'testtoken';
  var jb = 'test';
  if (msg==='help' || msg==='?') {
    res.reply(utils.get_help());
  } else if (msg.match(/^jb\s+\w+/)) {
    jb = msg.replace('jb', '');
    jb = jb.replace(/\s/g, '');
    dbclient.hset(user, "user", jb, function(err, msg) {
      if (err) {
        res.reply(`${jb}: 不能连接`);
      } else {
        res.reply(`${jb}: 连接成功`);
      }
    });
  } else if (msg.match(/^list\s+\w+/)) {
    jb = msg.replace('list', '');
    jb = jb.replace(/\s/g, '');
    res.reply([
      {
        title: '查看可选歌曲',
        description: '请从列表中选择播放歌曲',
        url: `http://www.bookxclub.com/musiclist?key=${jb}&token=${token}&user=${user}`
      }
    ]);
  } else if (msg.match(/^stop\s+\w+/)) {
    jb = msg.replace('stop', '');
    jb = jb.replace(/\s/g, '');
    dbclient.hset(jb, "play", "#STOP", function(err, msg) {
      if (err) {
        res.reply(`${jb}: Cant stop the music.`);
      } else {
        res.reply(`${jb}: Music stopped.`);
      }
    });
  } else if (msg.match(/^current\s+\w+/)) {
    jb = msg.replace('current', '');
    jb = jb.replace(/\s/g, '');
    dbclient.hget(jb, "play", function(err, msg) {
      if (err) {
        res.reply(`${jb}: Error!`);
      } else {
        if (msg) {
          if (msg==='#STOP') {
            res.reply(`${jb}: Stopped.`);
          } else {
            res.reply(`${jb}: ${msg}`);
          }
        } else {
          res.reply(`${jb}: Idle...`);
        }
      }
    });
  } else {
    res.reply([
      {
        title: '附近的点唱机',
        description: '请从列表中选择播放歌曲的点唱机',
        url: `http://www.bookxclub.com/jblist?user=${user}&token=${token}`
      }
    ]);
  }
})));

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
