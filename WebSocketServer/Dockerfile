# ---- Build args for all stages ----
ARG CRATE_NAME="web_socket_server"

# ---- Stage 1: Dependency planner (cargo-chef) ----
FROM rust:1.88 AS planner

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
FROM rust:1.88 AS cacher

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
FROM rust:1.88 AS builder

ARG CARGO_HOME_DIR=/

WORKDIR /build

# Copy source
COPY . .

# Dummy build file to make Cargo happy
RUN echo 'fn main() {}' > src/dummy.rs

# Build with cached cargo registry + target directory
# Build both tests and release mode.
# Copy the final build to the /app/ directory, to take it out of the cache.
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=/build/target \
    rm -f target/debug/debs/${CRATE_NAME}-* && \
    cargo test --no-run && \
    cargo build --release && \
    cp -rp /usr/local/cargo/registry /usr/local/cargo/registry_saved && \
    cp -rp /usr/local/cargo/git /usr/local/cargo/git_saved && \
    cp -rp . /app

# Copy saved cargo directories into intended locations.
# Allows use by testers
RUN cp -rp /usr/local/cargo/registry_saved /usr/local/cargo/registry
RUN cp -rp /usr/local/cargo/git_saved /usr/local/cargo/git

# Make /app the default working directory, where testers can run.
WORKDIR /app

# ---- Stage 4: Minimal runtime ----
FROM debian:trixie-slim AS final

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

RUN useradd -m appuser

COPY --from=builder /app/target/release/web_socket_server /usr/local/bin/web_socket_server

USER appuser
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/web_socket_server"]
