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
RUN \
    --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=/build/target \
    cargo chef cook --release --recipe-path recipe.json

# Optionally prepare test dependencies too
RUN \
    --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=/build/target \
    cargo chef cook --tests --recipe-path recipe.json

# ---- Stage 3: Application build ----
FROM rust:1.88 AS builder

ARG CARGO_HOME_DIR=/
ARG BUILD_DIR=/build
ARG DEST_DIR=/app

# Used for building the unit tests
ARG TEST_CACHE_DIR=${BUILD_DIR}/.test_cache

# Initialize the destination dir
RUN mkdir -p "${DEST_DIR}"

WORKDIR ${BUILD_DIR}

# Copy source
COPY . .

# Dummy build file to make Cargo happy
RUN echo 'fn main() {}' > src/dummy.rs

# Build the unit tests, with the sub-cache identified by the sha512 sum
# of the unit_tests.rs file. This will ensure that tests are re-compiled
# whenever unit_tests.rs is modified, without eliminated tests or "ghost" tests
# from other branches remaining in the target directory.
RUN \
  --mount=type=cache,target=/usr/local/cargo/registry \
  --mount=type=cache,target=/usr/local/cargo/git \
  --mount=type=cache,target=/build/target \
  --mount=type=cache,target=${TEST_CACHE_DIR} \
  TEST_TARGET_DIR="${TEST_CACHE_DIR}/$(sha512sum < src/unit_tests.rs | cut -d' ' -f-1)" \
  && mkdir -p "${TEST_TARGET_DIR}" \
  && cp -rp ${BUILD_DIR}/target/* "${TEST_TARGET_DIR}" \
  && cargo test --no-run --target-dir "${TEST_TARGET_DIR}" \
  && cp -rp "${TEST_TARGET_DIR}" "${DEST_DIR}/target"

# Build with cached cargo registry + target directory
# Build both tests and release mode.
# Copy the final build to the /app/ directory, to take it out of the cache.
RUN \
    --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=/build/target \
    cargo build --release && \
    cp -rp /usr/local/cargo/registry /usr/local/cargo/registry_saved && \
    cp -rp /usr/local/cargo/git /usr/local/cargo/git_saved && \
    cp -rp ./* ${DEST_DIR}

# Copy saved cargo directories into intended locations.
# Allows use by testers
RUN cp -rp /usr/local/cargo/registry_saved /usr/local/cargo/registry
RUN cp -rp /usr/local/cargo/git_saved /usr/local/cargo/git

# Make ${DEST_DIR} the default working directory, where testers can run.
WORKDIR ${DEST_DIR}

# ---- Stage 4: Minimal runtime ----
FROM debian:trixie-slim AS final

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

RUN useradd -m appuser

COPY --from=builder /app/target/release/web_socket_server /usr/local/bin/web_socket_server

USER appuser
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/web_socket_server"]
