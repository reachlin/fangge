```
# deploy to server
ansible-playbook -i inventory/dev --tags copy server_update.yml --ask-vault-pass
ssh lincai@bookxclub.com "cd /tmp/stage;docker-compose up -d --build"
ssh lincai@bookxclub.com "cd /tmp/stage;docker-compose ps"

ssh lincai@bookxclub.com "docker logs fangge_server"

curl -v 'http://bookxclub.com/token?name=redbox&secret=lincai081077'

# deploy agent to raspberry
ansible-playbook -i inventory/redbox -vvv --tags agent agent.yml

ssh pi@redbox sudo reboot now

# mac agent
python fangge-agent.py --id test --path Music --token "-6656710022"

```