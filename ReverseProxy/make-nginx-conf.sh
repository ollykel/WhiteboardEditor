#!/bin/sh

# Dynamically generates a nginx.conf file, parsing environment variables.
# Should be run on container startup.

DEST_FILE="$1"

cat > "${DEST_FILE}" << _EOF_
worker_processes 1;

events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    map \$http_upgrade \$connection_upgrade {
        default upgrade;
        ''      close;
    }

    # http auth server
    server {
        listen 80;
        server_name auth.${WHITEBOARD_EDITOR_DOMAIN};

        # auth server route
        location / {
            proxy_pass http://auth:${WHITEBOARD_EDITOR_AUTH_PORT};
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection \$connection_upgrade;
            proxy_set_header Host \$host;
            proxy_read_timeout 86400;
        }
    }

    # http default server
    server {
        listen 80;
        server_name ${WHITEBOARD_EDITOR_DOMAIN};

        # web socket server route
        location /ws {
            proxy_pass http://web_socket_server:3000/ws;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection \$connection_upgrade;
            proxy_set_header Host \$host;
            proxy_read_timeout 86400;
        }

        # api route
        location /api {
            proxy_pass http://rest_api:3000/api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection \$connection_upgrade;
            proxy_set_header Host \$host;
            proxy_read_timeout 86400;
        }

        # All other traffic goes to frontend
        location / {
            proxy_pass http://frontend:3000;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
        }
    }

    # https auth server
    server {
        listen 4430 ssl;
        server_name auth.${WHITEBOARD_EDITOR_DOMAIN};

        ssl_certificate       /app/cert.pem;
        ssl_certificate_key   /app/key.pem;

        ssl_protocols       TLSv1.2 TLSv1.3;
        ssl_ciphers         HIGH:!aNULL:!MD5;

        # auth server route
        location / {
            proxy_pass http://auth:${WHITEBOARD_EDITOR_AUTH_PORT};
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection \$connection_upgrade;
            proxy_set_header Host \$host;
            proxy_read_timeout 86400;
        }
    }

    # https default server
    server {
        listen 4430 ssl;
        server_name ${WHITEBOARD_EDITOR_DOMAIN};

        ssl_certificate       /app/cert.pem;
        ssl_certificate_key   /app/key.pem;

        ssl_protocols       TLSv1.2 TLSv1.3;
        ssl_ciphers         HIGH:!aNULL:!MD5;

        # web socket server route
        location /ws {
            proxy_pass http://web_socket_server:3000/ws;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection \$connection_upgrade;
            proxy_set_header Host \$host;
            proxy_read_timeout 86400;
        }

        # api route
        location /api {
            proxy_pass http://rest_api:3000/api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection \$connection_upgrade;
            proxy_set_header Host \$host;
            proxy_read_timeout 86400;
        }

        # All other traffic goes to frontend
        location / {
            proxy_pass http://frontend:3000;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
        }
    }
}
_EOF_
