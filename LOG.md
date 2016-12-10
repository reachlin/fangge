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
sudo diskutil unmountDisk /dev/disk1
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

## 11/07/2016
* deploy to raspberrypi
```
ansible-playbook -i inventory/agent --extra-vars "AGENT_ID=raspberrypi AGENT_TOKEN=1483551723" agent.yml
ansible-playbook -i inventory/agent agent.yml
```
* rasbian wifi config file
```
/etc/wpa_supplicant/wpa_supplicant.conf

network={
  ssid="foxriver"
  psk="xxxxxx"
  key_mgmt=WPA-PSK
}
```
* mpd mpc could be next player [doc](https://www.musicpd.org/doc/user/)
```
mpc update
mpc ls|mpc add
mpc play
mpc current
```

## 11/17/2016
* [How to Register Devices in IBM Watson IoT Platform](https://developer.ibm.com/recipes/tutorials/how-to-register-devices-in-ibm-iot-foundation/)
* [Connect a Raspberry Pi to IBM Watson IoT Platform](https://developer.ibm.com/recipes/tutorials/raspberry-pi-4/)

## 11/22/2016
```
pi@raspberrypi:~ $ amixer sget 'PCM'
Simple mixer control 'PCM',0
  Capabilities: pvolume pswitch pswitch-joined
  Playback channels: Front Left - Front Right
  Limits: Playback 0 - 37
  Mono:
  Front Left: Playback 17 [46%] [-20.00dB] [on]
  Front Right: Playback 17 [46%] [-20.00dB] [on]
pi@raspberrypi:~ $ amixer sset 'PCM' 80%
Simple mixer control 'PCM',0
  Capabilities: pvolume pswitch pswitch-joined
  Playback channels: Front Left - Front Right
  Limits: Playback 0 - 37
  Mono:
  Front Left: Playback 30 [81%] [-7.00dB] [on]
  Front Right: Playback 30 [81%] [-7.00dB] [on]
pi@raspberrypi:~ $ amixer sget 'PCM'
Simple mixer control 'PCM',0
  Capabilities: pvolume pswitch pswitch-joined
  Playback channels: Front Left - Front Right
  Limits: Playback 0 - 37
  Mono:
  Front Left: Playback 30 [81%] [-7.00dB] [on]
  Front Right: Playback 30 [81%] [-7.00dB] [on]
pi@raspberrypi:~ $ 
```

```
ansible-playbook -i inventory/agent -l red --extra-vars "AGENT_ID=redbox AGENT_TOKEN=-4499186814 AGENT_INFO=raspberrypi" agent.yml
```

sudo apt-get install pulseaudio pulseaudio-module-bluetooth
bluetoohctl power on, agent on, scan on, connect, trust

