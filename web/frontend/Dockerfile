# Interface chat Next.js (App Router) — TechCorp Financial Assistant.
FROM node:20-alpine

WORKDIR /app

# Deps d'abord (cache Docker).
COPY package.json package-lock.json ./
RUN npm ci

# Code + build de prod.
COPY . .
RUN npm run build

# next start écoute 0.0.0.0:3000 ; PORT surchargeable.
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start"]
