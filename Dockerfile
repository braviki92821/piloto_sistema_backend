FROM node:12.18.1

ADD . /backend
WORKDIR /backend

RUN npm install

EXPOSE 3000

CMD ["yarn", "start"]