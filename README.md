# fangge: a virtual jukebox application

A user can play a song on a jukebox located at home, a store, or a user's phone.

## Client Agent

### Supported Configuration

* raspberrypi
* Mac OS

### Dependencies

* VLC

### Installation

```
# set up raspberrypi
ansible-playbook -i inventory/agent --extra-vars "AGENT_ID=raspberrypi AGENT_TOKEN=xxxxxx" agent.yml
```

## Server

The server is written in nodejs backed by a Redis DB.

## Development

[Travis](https://travis-ci.org/reachlin/fangge)