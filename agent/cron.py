#!/usr/bin/python

import time
import subprocess

DELAY = 60
PLAYLIST = "test.m3u"

def job():
    print("%s play music..." % time.strftime("%Y/%m/%d-%H:%M:%S"))
    subprocess.call(["/Applications/VLC.app/Contents/MacOS/VLC", "--play-and-exit", "-I", "dummy", PLAYLIST])

while True:
    job()
    time.sleep(DELAY)