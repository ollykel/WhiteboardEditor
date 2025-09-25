ARG CONTAINER_REGISTRY_URI="docker.io"

# ---- Stage 1: Dependency planner (cargo-chef) ----
FROM ${CONTAINER_REGISTRY_URI}/rust:1.88 AS planner

WORKDIR /app

# Install cargo-chef
RUN cargo install cargo-chef

# Copy manifests
COPY Cargo.toml Cargo.lock ./

# Dummy build file to make Cargo happy
RUN mkdir src/ && echo 'fn main() {}' > src/dummy.rs

# Generate dependency build plan
RUN cargo chef prepare --recipe-path recipe.json

# ---- Stage 2: Dependency builder ----
FROM ${CONTAINER_REGISTRY_URI}/rust:1.88 AS cacher

WORKDIR /build
RUN cargo install cargo-chef

COPY --from=planner /app/recipe.json recipe.json
COPY Cargo.toml Cargo.lock ./

# Use buildkit cache mounts for cargo registry + target dir
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=/build/target \
    cargo chef cook --release --recipe-path recipe.json

# Optionally prepare test dependencies too
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=/app/target \
    cargo chef cook --tests --recipe-path recipe.json

# ---- Stage 3: Application build ----
FROM ${CONTAINER_REGISTRY_URI}/rust:1.88 AS builder

WORKDIR /build

# Copy source
COPY . .

# Build with cached cargo registry + target directory
# Build both tests and release mode.
# Copy the final build to the /app/ directory, to take it out of the cache.
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=/build/target \
    cargo build --tests && \
    cargo build --release && \
    cp -rp . /app

# Make /app the default working directory, where testers can run.
WORKDIR /app

# ---- Stage 4: Minimal runtime ----
FROM ${CONTAINER_REGISTRY_URI}/debian:trixie-slim AS final

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

RUN useradd -m appuser

COPY --from=builder /app/target/release/web_socket_server /usr/local/bin/web_socket_server

USER appuser
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/web_socket_server"]
