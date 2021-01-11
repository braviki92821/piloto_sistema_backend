FROM node:12.18.1

ADD . /backend
WORKDIR /backend

COPY ["package.json", "package-lock.json*", "webpack.config.js", "./"]

RUN npm install
COPY . .

RUN npm run build

CMD [ "npm", "start" ]
