FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN addgroup app && adduser -S app -G app

USER app

EXPOSE 3000

CMD ["node","src/index.js"]
