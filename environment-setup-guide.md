# Environment Setup Guide

This guide will help you test the new environment variable-based configuration locally before deploying to Render.

## Testing Locally

1. Make sure the `.env` file in the project root contains all the necessary environment variables from your `config.toml`.

2. Build and run the application locally to ensure it's working with the environment variables:

```bash
# Install dependencies if needed
npm install

# Start the application
npm start
```

3. In a separate terminal, make sure your UI is using the correct environment variables:

```bash
cd ui
npm install # if needed
npm run dev
```

4. Test the application by accessing it at http://localhost:3000

## Deploying to Render

Once you've confirmed everything works locally with environment variables, you can deploy to Render:

### Backend Deployment

1. Create a new Web Service in Render
2. Connect to your GitHub repository
3. Configure the following settings:
   - **Name**: levir-ai-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Copy all variables from your local `.env` file, making these adjustments:
     - Update `PORT` to use `$PORT` (Render provides this)
     - Update `SEARXNG_API_URL` to point to your production SearxNG instance
     - Ensure all API keys are correctly set

### Frontend Deployment

1. Create a new Web Service in Render or use Vercel
2. Connect to your GitHub repository
3. Configure the following settings:
   - **Name**: levir-ai-ui
   - **Environment**: Node
   - **Root Directory**: ui
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**: Set these variables:
     - `NEXT_PUBLIC_API_URL`: URL of your backend API (e.g., https://levir-ai-api.onrender.com/api)
     - `NEXT_PUBLIC_WS_URL`: WebSocket URL of your backend (e.g., wss://levir-ai-api.onrender.com)
     - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

## Important Notes

- The updated `config.ts` file will now prioritize environment variables over the `config.toml` file, so you can continue using `config.toml` for local development if you prefer.
- For security, make sure your repository doesn't contain sensitive API keys. The `.env` and `config.toml` files should be in `.gitignore`.
- For Render, use environment variables exclusively rather than relying on the `config.toml` file.
- Remember to update the URLs (especially CORS settings) to match your production domains. 