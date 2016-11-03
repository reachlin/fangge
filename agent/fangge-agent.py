#!/usr/bin/python

# add the next line to /etc/rc.local
# cd /home/pi/;./fangge-agent.py

import time
import subprocess
import urllib
import urllib2
import re
import argparse
from os import listdir
from os.path import isfile, join


JB_ID = "test"
DELAY = 70
URL_PREFIX = "http://www.bookxclub.com/";
PLAYLIST = "test.m3u"
song_list = []
play_cmd = "omxplayer -o alsa \"%s\""

def init():
    global play_cmd
    if isfile("/Applications/VLC.app/Contents/MacOS/VLC"):
        play_cmd = "/Applications/VLC.app/Contents/MacOS/VLC --play-and-exit -I dummy \"%s\""

def get_jb_info():
    ip = ""
    try:
        ip = subprocess.check_output(["hostname", "-I"])
    except:
        ip = "error"
    return ip

def register_music():
    global song_list
    song_list = sorted([f for f in listdir("Music") if isfile(join("Music", f))])
    onlyfiles = ["%d %s" % (i+1, f) for i, f in enumerate(song_list)]
    print("%s" % onlyfiles)
    url = URL_PREFIX + 'musiclist'
    values = {
            'jukebox' : JB_ID,
            'info': get_jb_info(),
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
    #play_cmd = 
    song = urllib2.urlopen(URL_PREFIX+"music?key=%s" % JB_ID).read()
    if song:
        print("...play song: "+song)
        play_song = song
        if song == "#STOP":
            print("stop")
        else:
            try:
                p = re.compile(r'^\d+')
                if p.match(song):
                    song = song_list[int(song)-1]
                song = "Music/"+song
                play_song = play_cmd % song
                subprocess.call(play_song, shell=True)
            except:
                print("play error: %s" % play_song)
    else:
        print("no song found.")


# main
parser = argparse.ArgumentParser(description='play songs under a folder')
parser.add_argument('--id', dest='id', required='true',
                   help='id of this agent')

args = parser.parse_args()
JB_ID = args.id
print "ID: %s" % JB_ID

time.sleep(7)    # without this rc.local will fail!
init()
register_music()
while True:
    job()
    time.sleep(DELAY)
