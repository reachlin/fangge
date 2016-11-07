module.exports = {
  get_help: function() {
    var msg = "===云唱机===\n";
    msg += "输入任意字符查找附近的点唱机，\n"
    msg += "然后就可以浏览并且点播喜欢的音乐了！\n"
    msg += "===2016===\nby reachlin@gmail.com\n";
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
    result = `${result}`
    console.log(`check_hash ${text},${hash},${result}`);
    if (hash===result) {
      return true;
    } else if (text==='test' && hash==='testtoken') { // remove it, this is only for test
      return true;
    }
    return false;
  }
};