FROM node:20.18.0-alpine AS builder

ARG NEXT_PUBLIC_WS_URL=ws://127.0.0.1:3001
ARG NEXT_PUBLIC_API_URL=http://127.0.0.1:3001/api
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY

WORKDIR /app

# Create public directory
RUN mkdir -p public

# Copy package files
COPY ui/package.json ui/yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --network-timeout 600000

# Copy source files
COPY ui .

# Create both .env and .env.local files with build arguments
RUN echo "NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL" > .env && \
    echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" >> .env && \
    echo "NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL" >> .env && \
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY" >> .env && \
    echo "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY" >> .env && \
    cp .env .env.local

# Build application
RUN yarn build

# Production image
FROM node:20.18.0-alpine

WORKDIR /app

# Create public directory
RUN mkdir -p public

# Copy built assets from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public/. ./public/
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/.env.local ./.env.local

# Start the application
CMD ["yarn", "start"]