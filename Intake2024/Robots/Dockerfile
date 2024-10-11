FROM node:18-alpine
COPY challenge/package.json /app/package.json
WORKDIR /app
RUN npm install
COPY challenge /app
EXPOSE 8080
CMD ["node", "index.js"]

