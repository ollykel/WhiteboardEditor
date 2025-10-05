# ---- Build args for all stages ----
ARG BUILD_DIR=/build
ARG DEST_DIR=/app

# ---- Stage 1: Dependency planner (cargo-chef) ----
FROM rust:1.88 AS planner

ARG BUILD_DIR
ARG DEST_DIR

WORKDIR ${BUILD_DIR}

# Install cargo-chef
RUN \
  --mount=type=cache,id=cargo_registry,target=/usr/local/cargo/registry \
  --mount=type=cache,id=cargo_git,target=/usr/local/cargo/git \
  cargo install cargo-chef

# Copy manifests
COPY Cargo.toml Cargo.lock ./

# Dummy build file to make Cargo happy
COPY <<-EOF src/dummy.rs
fn main() {}
EOF

# Generate dependency build plan
RUN \
  --mount=type=cache,id=cargo_registry,target=/usr/local/cargo/registry \
  --mount=type=cache,id=cargo_git,target=/usr/local/cargo/git \
  cargo chef prepare --recipe-path recipe.json

# ---- Stage: Test Builder ----
FROM rust:1.88 AS build_tests

ARG BUILD_DIR
ARG DEST_DIR

WORKDIR ${BUILD_DIR}

# Install cargo-chef
RUN \
  --mount=type=cache,id=cargo_registry,target=/usr/local/cargo/registry \
  --mount=type=cache,id=cargo_git,target=/usr/local/cargo/git \
  cargo install cargo-chef

# Copy manifests, recipe
COPY --from=planner ${BUILD_DIR}/recipe.json recipe.json
COPY Cargo.toml Cargo.lock ./

# Build test dependencies
RUN \
  --mount=type=cache,id=cargo_registry,target=/usr/local/cargo/registry \
  --mount=type=cache,id=cargo_git,target=/usr/local/cargo/git \
  --mount=type=cache,id=test_deps,target=${BUILD_DIR}/target \
  cargo chef cook --tests --recipe-path recipe.json

# Copy relevant source code
COPY ./src/lib.rs ./src/unit_tests.rs ./src

# Dummy build file to make Cargo happy
COPY <<-EOF src/dummy.rs
fn main() {}
EOF

# Build tests
RUN \
  --mount=type=cache,id=cargo_registry,target=/usr/local/cargo/registry \
  --mount=type=cache,id=cargo_git,target=/usr/local/cargo/git \
  --mount=type=cache,id=test_deps,target=${BUILD_DIR}/test_deps \
  <<_EOF_
#!/usr/bin/bash -e

cp -r --preserve=mode,timestamps ./test_deps ./target
cargo test --no-run
_EOF_

# ---- Stage: Prepare Test Runtime Environment ----
FROM rust:1.88 AS test_runtime

ARG BUILD_DIR
ARG DEST_DIR

WORKDIR ${BUILD_DIR}

# Copy cached build directories into final locations
RUN mkdir -p ${DEST_DIR} /usr/local/cargo

RUN \
  --mount=type=cache,id=cargo_registry,target=${BUILD_DIR}/registry \
  --mount=type=cache,id=cargo_git,target=${BUILD_DIR}/git \
  <<_EOF_
#!/usr/bin/bash -e

cp -r --preserve=mode,timestamps registry git /usr/local/cargo
_EOF_

# Set working directory to destination
WORKDIR ${DEST_DIR}

COPY Cargo.toml Cargo.lock .
COPY ./src ./src

# Copy target directory
COPY --from=build_tests ${BUILD_DIR}/target ./target

# Dummy build file to make Cargo happy
COPY <<-EOF src/dummy.rs
fn main() {}
EOF

ENTRYPOINT ["cargo", "test"]

# ---- Stage: Build Release Binary ----
FROM rust:1.88 AS build_release

ARG BUILD_DIR
ARG DEST_DIR

WORKDIR ${BUILD_DIR}

# Install cargo-chef
RUN \
  --mount=type=cache,id=cargo_registry,target=/usr/local/cargo/registry \
  --mount=type=cache,id=cargo_git,target=/usr/local/cargo/git \
  cargo install cargo-chef

# Copy manifests, recipe
COPY --from=planner ${BUILD_DIR}/recipe.json recipe.json
COPY Cargo.toml Cargo.lock ./

# Build release dependencies
RUN \
  --mount=type=cache,id=cargo_registry,target=/usr/local/cargo/registry \
  --mount=type=cache,id=cargo_git,target=/usr/local/cargo/git \
  --mount=type=cache,id=release_target,target=${BUILD_DIR}/target \
  cargo chef cook --release --recipe-path recipe.json

# Copy relevant source code
COPY ./src/lib.rs ./src/main.rs ./src

# Dummy build file to make Cargo happy
COPY <<-EOF src/dummy.rs
fn main() {}
EOF

# Build release binary
RUN \
  --mount=type=cache,id=cargo_registry,target=/usr/local/cargo/registry \
  --mount=type=cache,id=cargo_git,target=/usr/local/cargo/git \
  --mount=type=cache,id=release_target,target=${BUILD_DIR}/target \
  cargo build --release

# Copy final build from cache
WORKDIR ${DEST_DIR}

RUN \
  --mount=type=cache,id=release_target,target=${BUILD_DIR}/target \
  cp \
    --preserve=mode,timestamps \
    ${BUILD_DIR}/target/release/web_socket_server \
    ${DEST_DIR}/web_socket_server

# ---- Stage: Prepare Release Runtime Environment ----
FROM debian:trixie-slim AS release

ARG BUILD_DIR
ARG DEST_DIR

WORKDIR ${DEST_DIR}

RUN <<_EOF_
#!/bin/bash -e

apt-get update
apt-get install -y ca-certificates
rm -rf /var/lib/apt/lists/*
_EOF_

# Establishes dependency relationship between stages
COPY --from=build_release ${BUILD_DIR}/recipe.json recipe.json

# Copy cached binary into final location
COPY --from=build_release ${DEST_DIR}/web_socket_server /usr/local/bin/web_socket_server

# Set working directory to destination
RUN useradd -m appuser
USER appuser

EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/web_socket_server"]
