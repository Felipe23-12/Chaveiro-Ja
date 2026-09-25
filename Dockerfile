# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy project files
COPY app/package*.json ./
COPY app . .

# Install dependencies
RUN npm ci

# Build production bundle
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve to run the app
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start app
CMD ["serve", "-s", "dist", "-l", "3000"]
