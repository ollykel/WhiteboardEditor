ARG CONTAINER_REGISTRY_URI="docker.io"

FROM ${CONTAINER_REGISTRY_URI}/node:24-alpine3.21

# Create new working directory
WORKDIR /build

# Copy source files
COPY . .

# Install dependencies and build.
# Cache node_modules for future builds.
# Then, copy to /app directory for persistence, to allow in-image testing.
RUN \
  --mount=type=cache,target=/build/node_modules \
  yarn install && \
  npx tsc && \
  cp -rp . /app

# Run from /app
WORKDIR /app

# Run app
EXPOSE 3000
ENTRYPOINT ["node", "dist/src/main.js"]
