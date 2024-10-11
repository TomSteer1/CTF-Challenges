FROM node:alpine

RUN apk add --no-cache supervisor
RUN apk add --no-cache nginx

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN mkdir -p /var/www/html/bank
RUN mkdir -p /var/www/html/admin
RUN mkdir -p /var/www/html/bot

COPY ./bank/package.json /var/www/html/bank/package.json
COPY ./admin/package.json /var/www/html/admin/package.json
COPY ./bot/package.json /var/www/html/bot/package.json

WORKDIR /var/www/html/bank
RUN npm install

WORKDIR /var/www/html/admin
RUN npm install

WORKDIR /var/www/html/bot
RUN npm install

COPY ./nginx.conf /etc/nginx/http.d/default.conf
COPY supervisord.conf /etc/supervisord.conf
COPY flag.txt /flag.txt
RUN chmod 444 /flag.txt

# Copy the rest of the application, ignoring node_modules
COPY ./bank/app.js /var/www/html/bank
COPY ./bank/public /var/www/html/bank/public

COPY ./admin/app.js /var/www/html/admin
COPY ./admin/public /var/www/html/admin/public

COPY ./bot/app.js /var/www/html/bot

WORKDIR /var/www/html

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]

