FROM node:12.18.1

ADD . /backend
WORKDIR /backend

RUN npm install

EXPOSE 3004

CMD ["yarn", "start"]
