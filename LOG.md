fangge Development Log

## 10/15/2016
### drew architecture diag. and basic use cases
### script to play music
use vlc command line, on mac
```
/Applications/VLC.app/Contents/MacOS/VLC --play-and-exit test.m3u
```

## 10/15/2016
start working on agent

## 10/24/2016
```
diskutil list
sudo diskutil unmountDisk /dev/disk2
sudo dd bs=1m if=RuneAudio_rpi2_rp3_0.4-beta_20160321_2GB.img of=/dev/disk2
```

## 10/28/2016
```
def JB000 Kiss.mp3 # set the current song of JB000
music JB000 # list the song of JB000
# send JB000 song list to the server
curl --data "jukebox=JB000&songs=Kiss.mp3;ItsMyLife.mp3" http://ddoer.mybluemix.net/music
```

## 10/30/2016
* [ALSA basics](http://www.linuxjournal.com/node/6735/print)
* [ALSA configure](http://blog.scphillips.com/posts/2013/01/sound-configuration-on-raspberry-pi-with-alsa/)
```
aplay -l   # find usb card number e.g. 1
speaker-test -Dhw:1,0 -c2 -twav
```

sample alsa configure file
```
ls -l /usr/share/alsa/alsa.conf.d/
~/.asoundrc  # for a user

pcm.!default  {
 type hw card 1
}
ctl.!default {
 type hw card 1
}

```

## 11/04/2016
* [wechat doc](http://mp.weixin.qq.com/wiki/home/index.html)
* [my sample code](http://git.oschina.net/reachlin/samples)
* [jade to html](http://html2jade.org/)
* [weui](https://github.com/weui/weui)
* [bootstrap](http://getbootstrap.com/getting-started/)
* [wechat bot](https://github.com/node-webot/wechat)


/etc/wpa_supplicant/wpa_supplicant.conf

network={
  ssid="foxriver"
  psk="gpscookie"
  key_mgmt=WPA-PSK
}

network={
ssid="foxriver"
psk="gpscookie"

# Protocol type can be: RSN (for WP2) and WPA (for WPA1)
proto=WPA

# Key management type can be: WPA-PSK or WPA-EAP (Pre-Shared or Enterprise)
key_mgmt=WPA-PSK

# Pairwise can be CCMP or TKIP (for WPA2 or WPA1)
pairwise=TKIP

#Authorization option should be OPEN for both WPA1/WPA2 (in less commonly used are SHARED and LEAP)
auth_alg=OPEN
}