# Use the official NGINX image as the base image
FROM nginx:mainline-alpine3.20-slim

# Set the working directory inside the container
WORKDIR /usr/share/nginx/html

# Copy the content of your local 'public' directory to the NGINX html directory
COPY public/ /usr/share/nginx/html/

# Expose port 80 to allow web traffic
EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
