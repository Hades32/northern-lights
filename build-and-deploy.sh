#!/bin/bash -xe

docker build -t northern-lights:local .
docker kill northern-lights
sleep 1
docker rm northern-lights
docker run -d --net=host --restart=always --name="northern-lights" \
  -e "GW_IDENTITY=$(cat secret_GW_IDENTITY)" \
  -e "GW_PSK=$(cat secret_GW_PSK)" \
  -e "GW_ADDRESS=$(cat secret_GW_ADDRESS)" \
  --log-driver=json-file --log-opt=max-size=10m --log-opt=max-file=5 \
  northern-lights:local
