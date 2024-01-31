FROM node:18.18

WORKDIR /usr/src/app
COPY . /usr/src/app

# Install app dependencies

RUN yarn install


EXPOSE 3000
# Build and run the app
CMD yarn run start:prod