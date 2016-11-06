module.exports = {
  get_help: function() {
    var msg = "===点歌命令===\n";
    msg += "1. 选择点唱机:\n   jb <唱机编号>\n"
    msg += "2. 查看歌单:\n   list <唱机编号>\n";
    msg += "3. 当前歌曲:\n   current <唱机编号>\n";
    msg += "4. 停止播放:\n   stop <唱机编号>\n";
    msg += "5. 关于: about\n";
    msg += "---2016---\n   by reachlin@gmail.com\n";
    return msg;
  },
  create_id: function(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < length; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
  },
  check_hash: function(text, hash) {
    var str = `${text}ACEGREWREXafrewCDD123754Mh`;
    var result = str.split('').reduce((prevHash, currVal) => ((prevHash << 5) - prevHash) + currVal.charCodeAt(0), 0);
    console.log(`check_hash ${text},${hash},${result}`);
    if (hash===result) {
      return true;
    } else if (text==='test' && hash==='testtoken') { // remove it, this is only for test
      return true;
    }
    return false;
  }
};