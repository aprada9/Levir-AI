# Deploying to Render with config.toml

This guide explains how to deploy Levir AI to Render while maintaining your config.toml approach.

## Pre-deployment Steps

1. Create a production version of your config.toml:
   - Start with the provided `config.toml.prod` template
   - This is a minimal version with empty API keys
   - The actual values will be provided via environment variables

2. For security, make sure your sensitive API keys and configuration are NOT hard-coded in the config.toml that gets deployed.

## Render Deployment Steps

### Backend API Deployment

1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Configure the basic settings:
   - **Name**: levir-ai-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. Add the following environment variables:
   - `PORT`: Set to `$PORT` (Render will provide this)
   - `SIMILARITY_MEASURE`: Set to `cosine` or your preferred value
   - `SEARXNG_API_URL`: URL to your SearxNG instance
   - `OPENAI_API_KEY`: Your OpenAI API key
   - All other API keys as needed (GROQ, ANTHROPIC, etc.)
   - All database and Supabase configuration from your .env file

5. Deploy the service

### Frontend Deployment

1. Create a separate Web Service for the frontend
2. Connect to the same repository
3. Configure the following:
   - **Name**: levir-ai-ui
   - **Root Directory**: ui
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. Add these environment variables:
   - `NEXT_PUBLIC_API_URL`: URL to your backend API (e.g., https://levir-ai-api.onrender.com/api)
   - `NEXT_PUBLIC_WS_URL`: WebSocket URL (e.g., wss://levir-ai-api.onrender.com)
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

5. Deploy the frontend service

## How It Works

Thanks to the updated `config.ts` file, your application will:

1. First look for environment variables (provided by Render)
2. Fall back to the `config.toml` file if environment variables aren't present

For a Render deployment, the environment variables take precedence, while your local deployment can continue to use the config.toml file directly.

## Testing Your Deployment

1. After deployment, check your Render logs for any configuration errors
2. Test the frontend to ensure it connects properly to the backend
3. Verify that search and OCR functionality works as expected

## Troubleshooting

If you encounter issues:

1. **API Connection Errors**: Ensure your `NEXT_PUBLIC_API_URL` points to the correct API endpoint
2. **SearxNG Issues**: Verify your SearxNG instance is accessible from Render
3. **Database Connection Problems**: Check your Supabase credentials and connection string
4. **CORS Errors**: You might need to update CORS settings in your backend to allow your Render frontend domain 