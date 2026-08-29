FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY button/frontend-web/package*.json ./button/frontend-web/
RUN cd button/frontend-web && npm ci
COPY button/frontend-web ./button/frontend-web
RUN cd button/frontend-web && npm run build

FROM node:20-alpine AS backend
WORKDIR /app
COPY button/backend/package*.json ./button/backend/
RUN cd button/backend && npm ci --production
COPY button/backend ./button/backend

# Copy frontend build into backend public folder if exists
COPY --from=frontend-build /app/button/frontend-web/build ./button/backend/public

ENV PORT=3000
EXPOSE 3000

WORKDIR /app/button/backend
CMD ["node", "src/server.js"]
