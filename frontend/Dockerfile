FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=80
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 80
CMD ["node", "server.js"]
