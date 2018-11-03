#!/bin/bash -xe
cd ..
docker build -t northern-lights:local .
docker kill northern-lights
sleep 1
docker rm northern-lights
docker run -d --net=host --restart=always --name=northern-lights --log-driver=json-file --log-opt=max-size=10m --log-opt=max-file=5 northern-lights:local
