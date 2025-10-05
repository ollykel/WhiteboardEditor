FROM nginx:stable-alpine AS release

# Copy nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Copy ssl files
WORKDIR /app

# Expose port 8080 and start nginx
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
