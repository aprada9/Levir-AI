FROM node:20-slim

WORKDIR /home/levir-ai

COPY src /home/levir-ai/src
COPY tsconfig.json /home/levir-ai/
COPY drizzle.config.ts /home/levir-ai/
COPY package.json /home/levir-ai/
COPY yarn.lock /home/levir-ai/
COPY .env /home/levir-ai/

RUN mkdir /home/levir-ai/data
RUN mkdir /home/levir-ai/uploads

RUN yarn install
RUN yarn build

EXPOSE 3001

CMD ["yarn", "start"]