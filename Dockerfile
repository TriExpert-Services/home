# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
# - VITE_N8N_WEBHOOK_URL: legacy translation-form webhook (still hit directly)
# - VITE_N8N_CONTACT_WEBHOOK_URL: contact form n8n webhook
# (chatbot is now proxied through the chatbot-relay Supabase edge
#  function — its URL/secret live in Supabase secrets, not in the bundle.)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_N8N_WEBHOOK_URL
ARG VITE_N8N_CONTACT_WEBHOOK_URL

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_N8N_WEBHOOK_URL=$VITE_N8N_WEBHOOK_URL
ENV VITE_N8N_CONTACT_WEBHOOK_URL=$VITE_N8N_CONTACT_WEBHOOK_URL

# Build the application with environment variables
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Healthcheck uses wget (already in nginx:alpine via busybox) and pins to
# 127.0.0.1 — `localhost` inside the container resolves to ::1 first, but
# nginx only binds IPv4, so the IPv6 attempt gives Connection refused.
RUN printf '#!/bin/sh\nwget -q -O /dev/null http://127.0.0.1/health || exit 1\n' > /health.sh \
    && chmod +x /health.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD /health.sh

CMD ["nginx", "-g", "daemon off;"]