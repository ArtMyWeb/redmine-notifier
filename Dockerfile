FROM node:14.15.4-alpine

WORKDIR /root/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . /root/app

RUN yarn build && rm -R node_modules && rm -R src

RUN yarn install --production

CMD [ "node", "./dist/index.js" ]