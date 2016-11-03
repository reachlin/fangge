module.exports = {
  get_help: function() {
    var msg = "===点歌命令===\n";
    msg += "1. 选择点唱机:\n   jb <唱机编号>\n"
    msg += "2. 查看歌单: list\n";
    msg += "3. 播放歌曲:\n   play <歌曲编号>\n";
    msg += "4. 停止播放: stop\n";
    msg += "5. 关于: about\n";
    msg += "---2016---\n   by reachlin@gmail.com\n";
    return msg;
  }
};