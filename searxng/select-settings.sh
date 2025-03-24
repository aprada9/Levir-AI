#!/bin/sh

# Check if we're in production (Render sets this variable)
if [ -n "$IS_RENDER" ]; then
  echo "Running in production environment"
  cp /etc/searxng/config/settings.prod.yml /etc/searxng/settings.yml
else
  echo "Running in local environment"
  cp /etc/searxng/config/settings.local.yml /etc/searxng/settings.yml
fi

# Start SearxNG
exec /sbin/tini -- /usr/local/searxng/dockerfiles/docker-entrypoint.sh 