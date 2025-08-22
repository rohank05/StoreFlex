# Use Node.js 21 Alpine
FROM node:21-alpine

# Set working directory
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => { \
    process.exit(r.statusCode === 200 ? 0 : 1); \
  }).on('error', () => process.exit(1));"

# Start the application
CMD ["node", "src/server.js"]