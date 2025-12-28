# Use Node.js LTS (Alpine for smaller size)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose API port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
