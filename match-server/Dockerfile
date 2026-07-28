FROM node:22.12.0-alpine AS build
WORKDIR /app/match-server
COPY match-server/package*.json ./
RUN npm ci
COPY match-server ./
COPY src /app/src
RUN npm run build && npm prune --omit=dev

FROM node:22.12.0-alpine AS runtime
ENV NODE_ENV=production
ENV PORT=8787
WORKDIR /app/match-server
COPY --from=build /app/match-server/package*.json ./
COPY --from=build /app/match-server/node_modules ./node_modules
COPY --from=build /app/match-server/dist ./dist
USER node
EXPOSE 8787
CMD ["npm", "start"]
