# Use official Node.js image
FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies and clean up npm cache
RUN npm install --production && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build-next

# Command to run the application
CMD ["npm", "start"]