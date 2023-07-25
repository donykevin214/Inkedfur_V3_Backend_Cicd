#!/bin/bash

#give permission for everything in the express-app directory
sudo chmod -R 777 /root/inkdedfur-v3-backend-cicd

#navigate into our working directory where we have all our github files
cd /root/inkdedfur-v3-backend-cicd

#install node modules
sudo yarn install

#start our node app in the background
sudo pm2 start pm2.config.js

#save pm2 to auto restart if rebooed
sudo pm2 save