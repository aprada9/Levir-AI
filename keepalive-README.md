# Levir AI Keepalive Service

A simple Node.js service to ping Render instances and prevent them from going to sleep due to inactivity.

## Overview

Free Render instances go to sleep after periods of inactivity, which can cause long startup times when they're needed again. This service periodically pings your Render services to keep them active.

## Setup

1. Create a new service on Render (or any other platform that offers free always-on servers):
   - Choose "Web Service"
   - Connect your GitHub repository or use the "Upload Files" option
   - If using GitHub, set the repository to a new one containing these files
   - Set the Build Command to: `npm install`
   - Set the Start Command to: `npm start`

2. Configure environment variables:
   - `SEARXNG_URL`: Your SearxNG service URL with the /healthz endpoint
   - `BACKEND_URL`: Your Backend service URL with the /api endpoint

3. Deploy the service

## Local Development

To run locally:

```bash
# Install dependencies (none required by default)
npm install

# Set environment variables
export SEARXNG_URL=https://your-searxng-service.onrender.com/healthz
export BACKEND_URL=https://your-backend-service.onrender.com/api

# Run the service
node keepalive.js
```

## Customization

You can modify the ping intervals in the `keepalive.js` file. By default, each service is pinged every 10 minutes.

## Alternative Hosting Options

Besides Render, you could deploy this to:
- Vercel (serverless)
- Netlify (serverless)
- Railway (free tier)
- Fly.io (free tier)
- Heroku (free tier - requires sleep prevention as well)
- Oracle Cloud Free Tier (always free VM)

## Notes

This is a simple solution. For production systems, consider implementing more robust monitoring and alerting. 