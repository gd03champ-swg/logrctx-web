# Stage 1: Build the React app
FROM node:22.6.0 AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application files
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve the app with a minimal image
FROM node:22.6.0-alpine AS production

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy the build output from the builder stage
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV VITE_SELF_URL=https://logrctx.swiggyops.de
ENV VITE_API_URL=https://logrctx-api.swiggyops.de
ENV VITE_USER_POOL_ID=ap-southeast-1_crJBQ7yo6
ENV VITE_CLIENT_ID=4kqil27q4dcielr3vbdqqemkm5
ENV VITE_TOKEN_SIGNING_KEY_URL=https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_crJBQ7yo6/.well-known/jwks.json
ENV VITE_COGNITO_DOMAIN=logrctx.auth.ap-southeast-1.amazoncognito.com

# Expose port 80
EXPOSE 80

# Start the app
CMD ["serve", "-s", "dist", "-l", "80"]
