FROM node:12.18.1

ADD . /backend
WORKDIR /backend

COPY ["package.json", "webpack.config.js", "./"]

RUN npm install
COPY . .

RUN npm run prod

CMD [ "npm", "start" ]
