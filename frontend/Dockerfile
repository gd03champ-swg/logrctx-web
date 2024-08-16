FROM node:22.6.0

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm i -g serve

ENV VITE_API_URL=http://localhost:8000/reduce

RUN npm run build

EXPOSE 3000

CMD [ "serve", "-s", "dist" ]