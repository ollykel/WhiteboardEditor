# Boardly

A tool for creating diagrams collaboratively.

## Usage Guide

### Quick Start

This section will walk you through how to create a new whiteboard with Boardly.

To get started with Boardly, you will first need to create an account. All
you'll need to provide us is an email address and username. Your email address
will be the primary way by which other users find you in-app.

Once you've created a new account, you will be automatically logged in. On your
dashboard, you can create a new whiteboard using the "Create Whiteboard" button,
available in the top-left corner of the page.

Once you have created the whiteboard, you will be redirected to the whiteboard
editor, which will start with a single blank Canvas. A Canvas is the basic
subdivision of a whiteboard. You may subdivide a Canvas into multiple
sub-canvases to separate your whiteboard into multiple components and delegate
tasks to different members of your team.

## Sharing your Whiteboards

To add collaborators to your whiteboard, navigate to the editor page for your
whiteboard and click the "Share" button in the top-left corner of the page.
Here, you will be presented with a menu that lists all current collaborators. To
invite collaborators, simply provide their email as well as the permission level
you which to grant them. The permission levels are:

- view: The collaborator may only view the whiteboard
- edit: The collaborator may view and edit the whiteboard
- own: The collaborator may view, edit, and invite new collaborators to the
whiteboard

Note that you may invite collaborators who have not yet created an account with
Boardly. These collaborators will be sent an email notification, which will
instruct them to create an account. Once they have created an account with the
email address you provided, they will be able to access your whiteboard.

To delete remove a collaborator, simply click the "X" at the right side of their
listing.

To update a collaborator's permissions, simply re-invite them using a different
permission level.

### Install Dependencies

Boardly requires Docker to run. [Follow instructions to install
Docker on your OS.](https://docs.docker.com/desktop/)

Building with Docker requires the containerd image store.

To enable containerd image store with Docker Desktop, follow the instructions
[here](https://docs.docker.com/desktop/features/containerd/).

To enable containerd image store with Docker Engine, follow the instructions
[here](https://docs.docker.com/engine/storage/containerd/#enable-containerd-image-store-on-docker-engine).

### Configure Settings

You must create three files to properly configure the app:
    - .env: Miscellaneous environment variables used by multiple services.
    - .secrets/key.pem: The private key used for SSL.
    - .secrets/cert.pem: The signed certificate used for SSL.

To create .env, copy example.env to .env and fill out the required values
indicated by the comments.

To create key.pem and cert.pem for a testing environment, you may run the
following commands to create a private key and self-signed certificate.

Generate a private key:
```
openssl genrsa -out .secrets/key.pem 2048
```

Generate a certificate signing request:
```
openssl req -key .secrets/key.pem -new -out .secrets/cert.csr

Generate a self-signed certificate:
```
openssl x509 -signkey .secrets/key.pem -in .secrets/cert.csr -req -days 10 -out .secrets/cert.pem
```

Be aware that browsers will reject self-signed certificates by default. To
access Boardly while using a self-signed certificate, you will need to specify
that you are willing to accept the risk and continue in the Advanced Options
menu your browsers presents when you try to access Boardly.

### Build

To build the Docker services that make up Boardly, simply run the
following from the repository root directory:

```
docker compose build
```

To get caching to work correctly on your first attempt, you may need to run this
command with the --no-cache option:

```
docker compose build --no-cache
```


### Run

To run Boardly, simply run the following from the repository root
directory:

```
docker compose up --build -d
```

### View Logs

To view logs while Boardly is running, simply run:

```
docker compose logs
```

### Stop

To stop Boardly, run the following from the repository root:

```
docker compose down
```
