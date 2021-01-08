FROM node:12.18.1

WORKDIR /backend

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install
RUN npm run build

COPY . .

CMD [ "node", " ./dist/server.js" ]
