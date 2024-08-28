FROM node:22.6.0

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm i -g serve


ENV VITE_API_URL=https://logrctx-api.swiggyops.de
ENV VITE_USER_POOL_ID=ap-southeast-1_crJBQ7yo6
ENV VITE_CLIENT_ID=4kqil27q4dcielr3vbdqqemkm5
ENV VITE_TOKEN_SIGNING_KEY_URL=https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_crJBQ7yo6/.well-known/jwks.json
ENV VITE_COGNITO_DOMAIN=https://logrctx.auth.ap-southeast-1.amazoncognito.com

RUN npm run build

EXPOSE 80

CMD [ "serve", "-s", "dist", "-l", "80" ]