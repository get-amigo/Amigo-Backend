FROM node:18.18

# RUN apt-get --no-cache add g++ gcc libgcc libstdc++ linux-headers make python3

# RUN apt-get add fontconfig ttf-dejavu

# RUN apt-get add --no-cache curl && cd /tmp && curl -Ls https://github.com/dustinblackman/phantomized/releases/download/2.1.1/dockerized-phantomjs.tar.gz | tar xz && cp -R lib lib64 / && cp -R usr/lib/x86_64-linux-gnu /usr/lib && cp -R usr/share /usr/share && cp -R etc/fonts /etc && curl -k -Ls https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2 | tar -jxf - && cp phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/bin/phantomjs && rm -fR phantomjs-2.1.1-linux-x86_64 && apk del curl

# RUN npm install --quiet node-gyp -g

# Create work directory
WORKDIR /usr/src/app

# Install runtime dependencies
#RUN npm install yarn -g

# Copy app source to work directory
COPY . /usr/src/app

# Install app dependencies

RUN yarn install

EXPOSE 3000
# Build and run the app
CMD yarn run start:prod
