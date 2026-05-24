FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY database ./database
COPY scripts ./scripts
COPY src ./src
USER node
EXPOSE 5000
CMD ["node", "src/server.js"]
