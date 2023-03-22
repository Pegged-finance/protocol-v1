FROM node:14-alpine

COPY package.json .
COPY package-lock.json .
RUN npm i

COPY . /usr/src/app
WORKDIR /usr/src/app
