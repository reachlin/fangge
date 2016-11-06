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
PATH = "Music"
DELAY = 70
DELAY_SHORT = 7
URL_PREFIX = "http://www.bookxclub.com/";
PLAYLIST = "test.m3u"
song_list = []
TOKEN = "testtoken"

def init():
    print "init..."

def play_song(song):
    uname = subprocess.check_output(['uname', '-a'])
    if re.search("Darwin", uname):
        return subprocess.call("/Applications/VLC.app/Contents/MacOS/VLC --play-and-exit -I dummy \"%s\"" % song, shell=True)
    elif re.search("raspberrypi", uname):
        return subprocess.call(["omxplayer", "-o", "alsa", song])
    else:
        print "unknow system, don't know how to play"
        return -1

def get_jb_info():
    ip = ""
    try:
        ip = args.info+"-"+subprocess.check_output(["hostname", "-I"])
    except:
        ip = args.info
    return ip

def register_music():
    global song_list
    song_list = sorted([f for f in listdir(PATH) if isfile(join(PATH, f))])
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
    values = {
        'jukebox': JB_ID,
        'token': TOKEN
    }
    data = urllib.urlencode(values)
    req = urllib2.Request(URL_PREFIX+"playlist/delete", data)
    response = urllib2.urlopen(req)
    song = response.read()

    if song:
        print("...play song: "+song)
        p = re.compile(r'^#STOP')
        if p.match(song):
            print("...received: %s" % song)
            time.sleep(DELAY)
        else:
            try:
                p = re.compile(r'^\d+')
                if p.match(song):
                    song = song_list[int(song)-1]
                song = PATH+"/"+song
                rtn = play_song(song)
                print ("song play returned: %s" % rtn)
            except:
                print("play error: %s" % song)
            time.sleep(DELAY_SHORT)
    else:
        print("no song received.")
        time.sleep(DELAY)


# main
parser = argparse.ArgumentParser(description='play songs under a folder')
parser.add_argument('--id', dest='id', required='true',
                   help='id of this agent')
parser.add_argument('--path', dest='path', default='Music',
                   help='path to music')
parser.add_argument('--url', dest='url', default='http://www.bookxclub.com/', help='server url')
parser.add_argument('--info', dest='info', default="", help='server url')

args = parser.parse_args()
JB_ID = args.id
PATH = args.path
URL_PREFIX = args.url
print "ID: %s, Music folder: %s" % (JB_ID, PATH)

time.sleep(DELAY_SHORT)    # without this rc.local will fail!
init()
register_music()
while True:
    job()