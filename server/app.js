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

app.get("/playsong", function(req, res) {
    if (req.query && req.query.jukebox && req.query.song) {
        dbclient.hset(req.query.jukebox, "play", req.query.song, function(err, msg) {
          if (err) {
            res.render('wechat_msg', {"title":"INFO", "msg":"点歌失败"});
          } else {
            res.render('wechat_msg', {"title":"INFO", "msg":"点歌成功，将在当前歌曲结束后播放。"});
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
    dbclient.hget(req.query.key, "music", function(err, msg) {
      if (err) {
        res.render('wechat_msg', {"title":"ERROR", "msg":`${err}`});
      } else {
        if (msg) {
            var songs = msg.split('\n');
            res.render('wechat_list', {"title":"歌单", "items": songs, "jukebox": req.query.key});
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
  var jb = null;
  if (user in user_jb) {
    jb = `${user_jb[user]}`;
  } else {
    dbclient.hget(user, "user", function(err, msg) {
      if (err) {
        jb = null;
      } else {
        jb = msg;
      }
    });
  }
  if (msg==='help' || msg==='?') {
    res.reply(utils.get_help());
    return;
  } else if (msg.match(/^jb\s+\w+/)) {
    jb = msg.replace('jb', '');
    jb = jb.replace(/\s/g, '');
    user_jb[user] = jb;
    dbclient.hset(user, "user", jb, function(err, msg) {
      if (err) {
        res.reply(`${jb}: 不能连接`);
      } else {
        res.reply(`${jb}: 连接成功`);
      }
    });
    return;
  }
  if (!jb) {
    res.reply(`${user} 请先选择点唱机`);
    return;
  }
  if (msg==='list') {
    res.reply([
      {
        title: '查看可选歌曲',
        description: '请从列表中选择播放歌曲',
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
            res.reply(`${jb}: ${msg}`);
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
