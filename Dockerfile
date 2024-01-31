# Use the official Node.js image as a base image
FROM node:18.18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and yarn.lock files to the working directory
COPY package.json ./

# Install app dependencies
RUN yarn install

# Copy the entire project to the working directory
COPY . .

# Expose the port on which your application will run
EXPOSE 3000

# Build the application
RUN yarn build

# CMD to run the application
CMD ["yarn", "run", "start:prod"]
