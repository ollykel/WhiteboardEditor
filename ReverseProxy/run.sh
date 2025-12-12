#!/bin/sh

# Script that executes main container runtime.
# Must be run with superuser permission.

# First, generate nginx conf.
./make-nginx-conf.sh "/etc/nginx/nginx.conf"

# Finally, execute nginx
exec nginx -g 'daemon off;'
