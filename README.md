# Whiteboard Editor

A place to create diagrams collaboratively.

## Setup

### Install Dependencies

The Whiteboard Editor requires Docker to run. [Follow instructions to install
Docker on your OS.](https://docs.docker.com/desktop/)

### Configure Settings

Copy example.env to .env and fill out the required values.

### Build

To build the Docker services that make up the Whiteboard Editor, simply run the
following from the repository root directory:

```
docker compose build
```

### Run

To run the Whiteboard Editor, simply run the following from the repository root
directory:

```
docker compose up --build -d
```

### View Logs

To view logs while the Whiteboard Editor is running, simply run:

```
docker compose logs
```

### Stop

To stop the Whiteboard Editor, run the following from the repository root:

```
docker compose down
```
