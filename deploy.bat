
echo `WeihongAa!1` | rsync -av -e "ssh -p 22" public/  root@lusipad.com:/usr/local/nginx/html/

ssh root@lusipad.com "chmod 777 /usr/local/nginx/html -R"

pause