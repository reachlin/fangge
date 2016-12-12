#!/usr/bin/python

# add the next line to /etc/rc.local
# cd /home/pi/;./fangge-agent.py

import random
import logging
import traceback
import time
import subprocess
import urllib
import urllib2
import re
import argparse
from os import listdir
from os.path import isdir, isfile, join


JB_ID = "test"
DELAY = 70
DELAY_SHORT = 7
URL_PREFIX = "http://www.bookxclub.com/";
PLAYLIST = "test.m3u"
song_list = []
TOKEN = "testtoken"

def init():
    print "init..."

def check_usb():
    folders = ['/media/usb0', '/media/usb1', '/media/usb2', '/media/usb3',
        '/media/usb4', '/media/usb5', '/media/usb6', '/media/usb7']
    for folder in folders:
        if isdir(folder):
            files = listdir(folder)
            if files and len(files)>0:
                return folder
    return None

def fix_wifi():
    print "...fixing wifi..."
    try:
        folders = ['/media/usb0', '/media/usb1', '/media/usb2', '/media/usb3',
            '/media/usb4', '/media/usb5', '/media/usb6', '/media/usb7']
        for folder in folders:
            wifi_conf = folder+'/wifi.conf'
            if isfile(wifi_conf):
                subprocess.call("sudo cat %s > /etc/wpa_supplicant/wpa_supplicant.conf" % wifi_conf, shell=True)
                subprocess.call("sudo ifdown wlan0", shell=True)
                subprocess.call("sudo ifup wlan0", shell=True)
    except Exception as e:
        print e



def play_song(song):
    uname = subprocess.check_output(['uname', '-a'])
    if re.search("Darwin", uname):
        return subprocess.call("/Applications/VLC.app/Contents/MacOS/VLC --play-and-exit -I dummy \"%s\"" % song, shell=True)
    elif re.search("Linux", uname):
        return subprocess.call(["cvlc", "--play-and-exit", "-I", "dummy", song])
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

def register_music(music_folder):
    global song_list
    song_list = sorted([f for f in listdir(music_folder) if isfile(join(music_folder, f))])
    onlyfiles = ["%d %s" % (i+1, f) for i, f in enumerate(song_list)]
    print("%s" % onlyfiles)
    url = URL_PREFIX + 'musiclist'
    values = {
            'jukebox' : JB_ID,
            'info': get_jb_info(),
            'songs': '\n'.join(song_list),
            'token': TOKEN
            }
    data = urllib.urlencode(values)
    req = urllib2.Request(url, data)
    response = urllib2.urlopen(req)
    rtn = response.read()
    print("register %s" % rtn)

def job(music_folder):
    print("%s play music..." % time.strftime("%Y/%m/%d-%H:%M:%S"))

    status = urllib2.urlopen(URL_PREFIX+'jbstatus?jukebox='+JB_ID).read()
    if status:
        p_play = re.compile(r'^#PLAY')
        p_shuffle = re.compile(r'^#SHUFFLE')
        if p_shuffle.match(status):
            play_song(music_folder+'/shuffle.wma')
            time.sleep(DELAY_SHORT)
            song_name = random.choice(song_list)
            print("shuffling songs %s" % song_name)
            rtn = play_song(music_folder+"/"+song_name)
            print ("song play returned: %s" % rtn)
        elif p_play.match(status):
            song = urllib2.urlopen(URL_PREFIX+'playlist/current?jukebox='+JB_ID).read()
            if song:
                print("...play song: "+song)
                try:
                    # delete song from the server whatever
                    values = {
                        'jukebox': JB_ID,
                        'token': TOKEN
                    }
                    data = urllib.urlencode(values)
                    req = urllib2.Request(URL_PREFIX+"playlist/delete", data)
                    response = urllib2.urlopen(req)
                    song_deleted = response.read()
                    if song != song_deleted:
                        play_song(music_folder+'/lsxg.wma')
                        print("...inconsistent songs: %s - %s" % (song, song_deleted))

                    p = re.compile(r'^\d+')
                    p_cmd = re.compile(r'^#')
                    if p.match(song):
                        song_name = song_list[int(song)-1]
                    elif p_cmd.match(song):
                        song_name = 'dingdong.wma'
                    else:
                        song_name = song

                    song_name = music_folder+"/"+song_name
                    rtn = play_song(song_name)
                    print ("song play returned: %s" % rtn)
                except Exception as e:
                    play_song(music_folder+'/error.wma')
                    print("play error: %s %s" % (song, e))
            else:
                play_song(music_folder+'/comeon.wma')
                time.sleep(DELAY_SHORT)
                play_song(music_folder+'/shuffle.wma')
                time.sleep(DELAY_SHORT)
                song_name = random.choice(song_list)
                print("no song received, play a random song %s" % song_name)
                rtn = play_song(music_folder+"/"+song_name)
                print ("song play returned: %s" % rtn)
        else:
            play_song(music_folder+'/lsxg.wma')
            print("unknown status: %s" % status)
    else:
        play_song(music_folder+'/lsxg.wma')
        print("no status received")


# main
parser = argparse.ArgumentParser(description='play songs under a folder')
parser.add_argument('--id', dest='id', required='true',
                   help='id of this agent')
parser.add_argument('--path', dest='path', default='Music',
                   help='path to music')
parser.add_argument('--url', dest='url', default='http://www.bookxclub.com/', help='server url')
parser.add_argument('--info', dest='info', default="", help='server url')
parser.add_argument('--token', dest='token', required='true', help='token to connect to the server')
parser.add_argument('--usb', dest='usb', default=False, action='store_true')

args = parser.parse_args()
JB_ID = args.id
URL_PREFIX = args.url
TOKEN=args.token
current_path = args.path

play_song(current_path+'/init.wma')
print "ID: %s, Music folder: %s" % (JB_ID, current_path)

time.sleep(DELAY_SHORT)    # without this rc.local will fail!

try:
    init()
    register_music(current_path)
except:
    play_song(music_folder+'/network.wma')
    time.sleep(DELAY_SHORT)
    fix_wifi()
while True:
    try:
        play_song(current_path+'/ready.wma')
        time.sleep(DELAY_SHORT)
        job(current_path)
        if args.usb:
            usb_path = check_usb()
            if usb_path:
                current_path = usb_path
                register_music(current_path)
    except IOError:
        play_song(current_path+'/network.wma')
        time.sleep(DELAY_SHORT)
        fix_wifi()
    except KeyboardInterrupt:
        play_song(current_path+'/lsxg.wma')
        print("Bye!")
        import sys;sys.exit(0)
    except Exception as e:
        play_song(current_path+'/error.wma')
        logging.error(traceback.format_exc())