# 在苹果 OS X 上使用说明

安装fangge后可以通过微信控制苹果电脑上的歌曲播放，实现远程点歌。
*注意*本说明仅限于有一定电脑基础的人员，本人对于安装使用后的一切问题概不负责。有任何问题请自行阅读源代码。如果您不知道什么是python和VLC，请绕道。

## 安装前准备

* 苹果OS X电脑一台
* 安装python，OS X应该有自带的
* 安装VLC[http://www.videolan.org/vlc/download-macosx.html](http://www.videolan.org/vlc/download-macosx.html)
* 安装git
* 将您要播放的歌曲拷贝到一个目录（比如：~/Desktop/Music）

## 安装

从github上克隆源代码。

```
git clone https://github.com/reachlin/fangge.git
```

## 使用

* 启动fangge

```
cd fangge/agent/
python fangge-agent.py --id guest1 --path ~/Desktop/Music --token "4125227137"

```
* 查找并添加微信公众号*reachlin_pub*
* 向公众号发送任意字符得到点歌机列表
* 从列表中找到您的点歌机（guest1）
* 进入guest1查看歌曲列表，点击点歌

## 常见问题

### fangge命令参数

`python fangge-agent.py -h`显示所有参数说明

```
optional arguments:
  -h, --help     帮助信息
  --id ID        点歌机的唯一标示
  --path PATH    歌曲目录
  --url URL      不用写
  --info INFO    点歌机的说明，任意字符，不要太长！
  --token TOKEN  点歌机的密码，必须和标示配合
  --usb          苹果电脑不用写
```

### 点歌机的标示和密码

下面是几个免费的公用标示和密码对，如果您需要自己专用的，请电邮reachlin@gmail.com。

```
guest1 4125227137
guest2 791873858
guest3 -2541479421
```

### 微信使用问题

* 微信进入点歌机后，出于安全性考虑，如果超过一定时间会超时。请重新在微信公众号中输入任意字符进入。
* 点歌后可以查看正在播放歌曲列表。
* 相同点歌机标示会相互影响，所以建议申请专属标示。

## 最后，欢迎大家关注fangge树莓派智能硬件。 HAPPY HACKING！