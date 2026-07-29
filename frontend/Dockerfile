# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
# Custom SPA nginx config will be mounted via docker-compose if needed, 
# otherwise default nginx serves static files on port 80.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
