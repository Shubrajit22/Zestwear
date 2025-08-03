# Use slim Node 22 image
FROM node:22-slim

# Install system dependencies needed for native binaries
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install global tools (ts-node, typescript if needed)
RUN npm install -g ts-node typescript

# Copy package files first (optimizes caching)
COPY package*.json ./
COPY prisma ./prisma

# Install dependencies with force flag and rebuild native modules
RUN npm install --force
RUN npm rebuild lightningcss --platform=linux --arch=x64

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Clean any potential cache issues and rebuild if needed
RUN rm -rf node_modules/.cache
RUN npm rebuild

# Build the Next.js app
#RUN npm run build

# (Optional) Run DB seed (you can comment/uncomment as needed)
# RUN npx ts-node prisma/seed.ts

# Expose port and run app
EXPOSE 3000
CMD ["npm", "start"]