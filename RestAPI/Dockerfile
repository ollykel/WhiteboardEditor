FROM node:24-alpine3.21

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
