# Use an official Node runtime as a parent image
FROM node:18.18

# Create work directory
WORKDIR /usr/src/app

# Copy app source to work directory
COPY . /usr/src/app

# Install app dependencies
RUN yarn install

# Expose the port the app runs on
EXPOSE 3000

# Build and run the app
CMD ["yarn", "start:prod"]
