# Use official Node 22 slim image
FROM node:22-slim

# Set working directory inside container
WORKDIR /app

# Copy package files first (for better caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --production

# Copy source files
COPY . .

# Build your Next.js app
RUN npm run build

# Install Prisma client (needed for migrations)
RUN npm install prisma

# Expose default Next.js port
EXPOSE 3000

# Run migrations and then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
