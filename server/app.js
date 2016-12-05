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

app.get("/token", function(req, res) {
  if (req.query && req.query.name && req.query.secret && req.query.secret==='lincai081077') {
    res.send(utils.get_hash(req.query.name));
  } else {
    res.send('I am watching you...');
  }
});

// the agent register itself after boot
app.post("/musiclist", function(req, res) {
  if (req.body && req.body.jukebox && req.body.token) {
    if (utils.check_hash(req.body.jukebox, req.body.token)) {
      console.log(`---save ${req.body}`);
      dbclient.hset("jukebox", req.body.jukebox, req.body.info, function(err, msg) {
        console.log(`--jukebox ${err}, ${msg}`);
      });
      dbclient.hset(req.body.jukebox, "music", req.body.songs, function(err, msg) {
        if (err) {
          res.send({"error":`${err}`});
        } else {
          res.send({"data":"OK"});
        }
      });
    } else {
      res.send({"error":"unauthorized agent"});
    }
  } else {
    res.send({"error":"missing parameters"});
  }
});

// get jukebox heartbeat
app.get("/jb", function(req, res) {
  if (req.query && req.query.jukebox) {
    dbclient.get("heartbeat_"+req.query.jukebox, function(err, msg) {
      if (err) {
        res.send({"error":`${err}`});
      } else {
        if (msg) {
          res.send({"jukebox": req.query.jukebox, "heartbeat": msg});
        } else {
          res.send({"error":`null`});
        }
      }
    });
  } else {
    res.send({"error":`missing parameters`});
  }
});

// get jukebox list
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
            dbclient.get("heartbeat_"+req.query.key, function(err2, msg2) {
              var uptime = 0;
              var d = new Date();
              var now = d.getTime();
              if (msg2) {
                uptime = Math.round((now - msg2)/1000/60/60);
              }
              var songs = msg["music"].split('\n');
              res.render('wechat_song_list', {"title":"歌单", "items": songs, "jukebox": req.query.key, "token": req.query.token, "user": req.query.user, "uptime": uptime});
            });
        } else {
            res.render('wechat_msg', {"title":"错误", "msg":"无此点唱机"});
        }
      }
    });
  } else {
    res.render('wechat_msg', {"title":"ERROR", "msg":"missing query parameter"});
  }
});

// show play list of a jukebox after a user order a song
// curl -v http://localbox/playlist?jukebox=test&user=developer&token=testtoken
app.get("/playlist", function(req, res) {
  if (req.query && req.query.jukebox) {
    dbclient.lrange("playlist_"+req.query.jukebox, 0, -1, function(err, playlist) {
      if (err) {
        res.render('wechat_msg', {"title":"ERROR", "msg":`获取歌单失败:${err}`});
      } else {
        dbclient.hget(req.query.jukebox, "music", function(err, songlist) {
          if (err) {
            res.render('wechat_msg', {"title":"ERROR", "msg":`${err}`});
          } else {
            var items;
            if (songlist) {
              items = songlist.split('\n');
            } else {
              items = [];
            }
            var rtn = [];
            for (var song in playlist) {
              var index = parseInt(`${playlist[song]}`)-1;
              if (index>=0 && index < items.length) {
                rtn.push({"index":playlist[song], "name":items[index]});
              }
            }
            res.render('wechat_play_list', {"title":"播放队列", "items": rtn, "jukebox": req.query.jukebox});
          }
        });
      }
    });
  } else {
    res.render('wechat_msg', {"title":"ERROR", "msg":"missing query parameter"});
  }
});

// agent plays a song
// curl -V http://localbox/playlist/current?jukebox=test
app.get("/playlist/current", function(req, res) {
  if (req.query && req.query.jukebox) {
    var dt = new Date();
    var now = dt.getTime();
    dbclient.get("heartbeat_"+req.query.jukebox, function(err, msg) {
      if (err || !msg) {
        dbclient.set("heartbeat_"+req.query.jukebox, now, function(err, msg) {
          if (!err) {
            dbclient.expire("heartbeat_"+req.query.jukebox, 365, function(err, msg) {
              console.log(`${req.query.jukebox} - ${now} - 365 error ${err}`);
            });
          }
        });
      } else {
        dbclient.expire("heartbeat_"+req.query.jukebox, 365, function(err, msg) {
          console.log(`${req.query.jukebox} - ${now} - 365 error ${err}`);
        });
      }
    });
    dbclient.lindex("playlist_"+req.query.jukebox, 0, function(err, msg) {
      if (err) {
        res.send(`#STOP:${err}`);
      } else {
        res.send(msg);
      }
    });
  } else {
    res.send('#STOP:missing parameters');
  }
});

// agent delete a song after plays it
// curl -v --data "jukebox=test&token=testtoken" http://localbox/playlist/delete
app.post("/playlist/delete", function(req, res) {
  if (req.body && req.body.jukebox && req.body.token) {
    if (utils.check_hash(req.body.jukebox, req.body.token)) {
      dbclient.lpop("playlist_"+req.body.jukebox, function(err, msg) {
        if (err) {
          res.send(`#STOP:${err}`);
        } else {
          if (msg) {
            res.send(msg);
          } else {
            res.send('#STOP:empty list');
          }
        }
      });
    } else {
      res.send('#STOP:unauthorized');
    }
  } else {
    res.send('#STOP:missing parameters');
  }
});

// user order a song
// curl -v --data "jukebox=test&user=developer&token=testtoken&song=1" http://localbox/playlist
app.post("/playlist", function(req, res) {
  if (req.body && req.body.jukebox && req.body.user && req.body.song) {
    dbclient.get('session_token_'+req.body.user, function(err, msg) {
      if (msg) {
        dbclient.rpush("playlist_"+req.body.jukebox, req.body.song, function(err, msg) {
          if (err) {
            res.send({"title":"ERROR", "msg":`点歌失败:${err}`});
          } else {
            res.send({"title":"OK", "msg":`点歌[${req.body.song}]成功`});
          }
        }); 
      } else {
        res.send({"title":"错误", "msg":`超时，请重新从微信发起操作`});
      }
    });
  } else {
    res.send({"title":"ERROR", "msg":`missing parameters`});
  }
});

app.get('/', function (req, res) {
  res.sendFile('/index.html');
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
  var d = new Date();
  var now = d.getTime();
  // set session token for the user auth from wechat
  dbclient.set('session_token_'+user, now, function(err, msg) {
    if (!err) {
      dbclient.expire('session_token_'+user, 60, function(err, msg) {
        if (!err) {
          console.log(`set user token ${user} ${now}`);
        }
      });
    }
  });
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
  } else if (msg.match(/^stop\s+\w+/)) {
    jb = msg.replace('stop', '');
    jb = jb.replace(/\s/g, '');
    dbclient.lpush("playlist_"+jb, "#STOP", function(err, msg) {
      if (err) {
        res.reply(`${jb}: Cant stop the music.`);
      } else {
        res.reply(`${jb}: Music stopped.`);
      }
    });
  } else if (msg.match(/^play\s+\w+/)) {
    jb = msg.replace('play', '');
    jb = jb.replace(/\s/g, '');
    dbclient.lpop("playlist_"+jb, function(err, msg) {
      if (err) {
        res.reply(`${jb}: Error!`);
      } else {
        if (msg) {
          if (msg==='#STOP') {
            res.reply(`${jb}: resumed.`);
          } else {
            res.reply(`${jb}: skipped ${msg}`);
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
