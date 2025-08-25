FROM node:24-alpine3.21

# Install curl for testing purposes
RUN apk add curl

# Copy configuration files
COPY package.json .
COPY yarn.lock .

# Install dependencies
RUN yarn install

# Copy all other source files
COPY . .

# Build source files
RUN npx tsc

# Run app
EXPOSE 3000
ENTRYPOINT ["node", "dist/main.js"]
