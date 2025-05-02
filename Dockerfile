# Base Node image
FROM node:18-alpine AS base
# Set working directory
WORKDIR /app
# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed
RUN apk add --no-cache libc6-compat
COPY package.json ./ 
COPY server/package.json ./server/
COPY client/package.json ./client/
COPY shared/package.json ./shared/
RUN npm install

# Build the project
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# First, build the shared package
RUN cd shared && npm run build
# Then, build the client
RUN cd client && npm run build
# Then, build the server
RUN cd server && npm run build

# Production image, copy all the files and run the server
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy only necessary files
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/server/dist ./server/dist
COPY --from=builder --chown=nextjs:nodejs /app/server/node_modules ./server/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/server/package.json ./server/
COPY --from=builder --chown=nextjs:nodejs /app/client/.next ./client/.next
COPY --from=builder --chown=nextjs:nodejs /app/client/public ./client/public
COPY --from=builder --chown=nextjs:nodejs /app/client/node_modules ./client/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/client/package.json ./client/
COPY --from=builder --chown=nextjs:nodejs /app/shared/dist ./shared/dist
COPY --from=builder --chown=nextjs:nodejs /app/shared/node_modules ./shared/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/shared/package.json ./shared/

# Run the server
CMD ["npm", "start"]