FROM node:24-alpine3.21

# Create new working directory
WORKDIR /app

# Copy source files
COPY . .

# Install dependencies and build.
# Cache node_modules for future builds.
RUN \
  --mount=type=cache,target=/app/node_modules \
  yarn install && \
  npx tsc

# Run app
EXPOSE 3000
ENTRYPOINT ["node", "dist/src/main.js"]
