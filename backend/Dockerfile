FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
COPY node_modules ./node_modules
COPY database ./database
COPY scripts ./scripts
COPY src ./src
EXPOSE 5000
CMD ["node", "src/server.js"]
