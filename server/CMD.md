```
# deploy to server
ansible-playbook -i inventory/dev --tags copy server_update.yml --ask-vault-pass
ssh lincai@bookxclub.com "cd /tmp/stage;docker-compose up -d --build"
ssh lincai@bookxclub.com "cd /tmp/stage;docker-compose ps"

ssh lincai@bookxclub.com "docker logs fangge_server"
```