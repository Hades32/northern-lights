FROM node
WORKDIR /app
CMD node index.js
COPY ./ /app
RUN node install
