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
def JB000 Kiss.mp3
music JB000
curl --data "jukebox=JB000&songs=Kiss.mp3;ItsMyLife.mp3" http://ddoer.mybluemix.net/music
```