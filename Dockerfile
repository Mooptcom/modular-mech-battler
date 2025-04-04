# Use an official Node.js runtime as a parent image
# Choose a version compatible with HYTOPIA SDK and your needs (e.g., LTS version)
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies using npm (recommended for better compatibility than bun in some cases)
# Install dependencies, including devDependencies
RUN npm install --production=false

# Copy the rest of the application code
COPY . .

# Transpile TypeScript to JavaScript (if your start script doesn't handle this)
# RUN npm run build # Uncomment if you have a build script in package.json

# Expose the port the app runs on (adjust if HYTOPIA uses a different port)
EXPOSE 3000

# Define the command to run the application
# Define the command to run the application using ts-node
CMD [ "npx", "ts-node", "index.ts" ]