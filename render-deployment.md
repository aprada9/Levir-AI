# Render Deployment Guide

This guide provides step-by-step instructions to deploy Levir AI on Render.

## The Issue

The error you're encountering occurs because:
1. You're trying to deploy from the `searxng` folder
2. Render is looking for `config.toml` in `/opt/render/project/src/` but can't find it
3. The main application's `config.toml` is in the root directory

## Solution

### Step 1: Configure the Right Root Directory

When creating your Render Web Service, you should set the root directory to the main project folder, not the `searxng` folder.

1. Go to your Render dashboard
2. Create a new Web Service or edit your existing one
3. Connect to your GitHub repository
4. In the "Root Directory" field, leave it blank or set it to `/` to use the repository root

### Step 2: Create a Build Script

You have two options:

#### Option A: Use Our Build Script

We've created a `render-build.sh` script that:
1. Installs dependencies
2. Builds the TypeScript project
3. Copies the `config.toml.prod` to the location Render expects it

To use this script:

1. In Render, set your build command to:
   ```
   chmod +x render-build.sh && ./render-build.sh
   ```

2. Set your start command to:
   ```
   npm start
   ```

#### Option B: Modify Render Settings Directly

Alternatively, you can set the build command in Render to:

```
npm install && npm run build && mkdir -p /opt/render/project/src/ && cp ./config.toml.prod /opt/render/project/src/config.toml
```

And the start command to:
```
npm start
```

### Step 3: Set Environment Variables

Add these required environment variables in your Render service:

- `PORT`: Set to `$PORT` (Render will provide this automatically)
- `SIMILARITY_MEASURE`: Set to `cosine`
- `OPENAI_API_KEY`: Your OpenAI API key
- `SEARXNG_API_URL`: URL to your SearxNG instance
- Other database and Supabase variables from your `.env` file

### Step 4: Deploy SearxNG Separately (Optional)

If you need to deploy SearxNG as well:

1. Create a separate Web Service in Render
2. Point it to the `searxng` directory of your repository
3. Use the appropriate Docker configuration or build commands for SearxNG

## Frontend Deployment

For the Next.js frontend:

1. Create a new Web Service in Render
2. Set the root directory to `ui`
3. Set the build command to:
   ```
   npm install && npm run build
   ```
4. Set the start command to:
   ```
   npm start
   ```
5. Configure these environment variables:
   - `NEXT_PUBLIC_API_URL`: The URL to your backend API
   - `NEXT_PUBLIC_WS_URL`: The WebSocket URL
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

## Troubleshooting

If you still encounter issues:

1. Check Render logs for specific error messages
2. Verify that the `config.toml` file is being copied correctly
3. Make sure all environment variables are set properly
4. Confirm that your database connection is working

Remember that you can always test your deployment locally with:
```
npm install
npm run build
npm start
``` 