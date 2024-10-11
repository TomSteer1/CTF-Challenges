FROM node:14.17.0-alpine3.13

# Create app directory
COPY challenge /app
COPY flag.txt /flag.txt
WORKDIR /app
RUN npm install

EXPOSE 3000
ENTRYPOINT [ "node", "/app/index.js" ]
