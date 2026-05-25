# Stage 1: Build React App
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./
RUN npm ci

# Copy full application code
COPY . .

# Set API URL build arg (defaults to localhost:8000 for standard local setups)
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

# Build for production
RUN npm run build

# Stage 2: Serve build assets with Nginx
FROM nginx:alpine

# Copy static assets from build stage to nginx folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Import our custom SPA redirect Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
