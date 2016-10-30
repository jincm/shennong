# cbt-ng-css
This project is generated with [yo angular generator]

#普通用户运行docker
sudo gpasswd -a ${USER} docker
sudo service docker restart
sudo chmod a+rw /var/run/docker.sock

# export/import docker image
docker export dockerid > app_server.tar
cat app_server.tar | sudo docker import - zuohaoshi/app_server
或者
docker import http://example.com/exampleimage.tgz zuohaoshi/app_server

#for docker run from app_server.tar
docker run --name=app_server -p 8080:8080 -p 222:22 -it zuohaoshi/app_server /bin/bash
docker start app_server
#docker run --name=ubuntu_client -p 9000:9000 -p 35729:35729 -it ubuntu_client /bin/bash

# for run web server
# mkdir /data/db
# 服务器上
service mongodb start
# docker里面
service ssh start 
service redis-server start && service nginx start && /usr/local/bin/uwsgi /home/jincm/zuohaoshi/server/uwsgi_config.ini
kill -9 `pidof uwsgi` && /usr/local/bin/uwsgi /home/jincm/zuohaoshi/server/uwsgi_config.ini

#################################################################################################
#构建docker运行环境过程（只须第一次需要，如果用构建好的docker镜像直接run即可，不需要这些操作）：
#################################################################################################
#update ubuntu
apt-get update && apt-get install -y git

# 构建nodejs开发环境，deploy for nodejs
mkdir -p /home/jincm/zuohaoshi/develop/
scp node-v4.4.4-linux-x64.tar root@172.17.0.9:/home/jincm/zuohaoshi/develop/
cat /root/.profile :export PATH=/home/jincm/zuohaoshi/develop/node-v4.4.4-linux-x64/bin:$PATH
source /root/.profile

#update npm
vi ~/.npmrc
registry = https://registry.npm.taobao.org
npm install -g npm

npm install -g gulp bower yo  #generator-angular
npm install gulp yo

# execute otherwise:yo will error:permission denied, open '/root/.config/configstore/insight-yo.json')
chmod g+rwx /root /root/.config /root/.config/configstore 
# execute otherwise:permission denied, open '/home/jincm/zuohaoshi/client/app/scripts/app.js)
chmod g+rwx -R /home/jincm/zuohaoshi/client/app 

#install some additional package
cd /home/jincm/zuohaoshi/client
bower install --allow-root 

#docker中安装bower组件
bower search ngDialog --allow-root
#对话框组件（不用bootstrap插件？）
bower install ng-dialog --allow-root（https://github.com/likeastore/ngDialog）

#参考的bootstrap和angularjs
http://v3.bootcss.com/components/#dropdowns
http://www.runoob.com/angularjs/angularjs-forms.html

#add new module
pushd /home/jincm/zuohaoshi/client
yo angular:route new_module

# 技巧：copy file to docker:with beyondcompare
/var/lib/docker/aufs/mnt/9b3536e8cfd6401cd0f3ac6a4a7742774ea0ad321db3005cf0d33367698e851e/home/jincm/zuohaoshi

#编译运行
pushd /home/jincm/zuohaoshi/client
gulp build
gulp serve

## Testin
Running `gulp test` will run the unit tests with karma.

