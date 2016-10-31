#!/usr/bin/python

# add the next line to /etc/rc.local
# cd /home/pi/;./fangge-agent.py

import time
import subprocess
import urllib
import urllib2
from os import listdir
from os.path import isfile, join

DELAY = 7
PLAYLIST = "test.m3u"

def register_music():
    onlyfiles = ["%d %s" % (i+1, f) for i, f in enumerate(listdir("Music")) if isfile(join("Music", f))]
    print("%s" % onlyfiles)
    url = 'http://ddoer.mybluemix.net/music'
    values = {
            'jukebox' : 'JB000',
            'songs' : '\n'.join(onlyfiles)
            }
    data = urllib.urlencode(values)
    req = urllib2.Request(url, data)
    response = urllib2.urlopen(req)
    rtn = response.read()
    print("register %s" % rtn)

def job():
    print("%s play music..." % time.strftime("%Y/%m/%d-%H:%M:%S"))
    # Mac OS
    #play_cmd = ["/Applications/VLC.app/Contents/MacOS/VLC", "--play-and-exit", "-I", "dummy", PLAYLIST]
    song = urllib2.urlopen("http://ddoer.mybluemix.net/music?key=JB000").read()
    if song:
        print("..."+song)
        if song == "#STOP":
            print("stop")
        else:
            song = "Music/"+song
            play_cmd = ["omxplayer", "-o", "alsa", song];
            subprocess.call(play_cmd)
    else:
        print("no song found.")

time.sleep(7)    # without this rc.local will fail!
register_music()
while True:
    job()
    time.sleep(DELAY)
