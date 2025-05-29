FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY ./frontend .

# Expose port
EXPOSE 3001

# Start the development server with host flag to allow external access
CMD ["npm", "run", "dev", "--", "--host"]