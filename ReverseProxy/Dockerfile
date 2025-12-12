FROM nginx:stable-alpine AS release

WORKDIR /app

# Copy scripts
COPY ./make-nginx-conf.sh .
COPY ./run.sh .

# Expose port 8080 and execute startup script
EXPOSE 8080
CMD ["./run.sh"]
