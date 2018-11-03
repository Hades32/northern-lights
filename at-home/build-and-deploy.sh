#!/bin/bash -xe
cd ..
node install
docker build -t northern-lights:local .
cd at-home
sed -i "s/%GIT_HASH%/$(git rev-parse --short HEAD)/" *.yaml
kubectl apply -f ./
