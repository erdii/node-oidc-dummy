FROM node:12.17-slim

WORKDIR /pkg

ADD package.json package-lock.json /pkg/
ADD ./src /pkg/src
