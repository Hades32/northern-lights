FROM node
WORKDIR /app
CMD node index.js
ENV GW_IDENTITY = "TODO"
ENV GW_PSK = "TODO"
ENV GW_ADDRESS = "TODO"
COPY ./ /app
RUN npm install
