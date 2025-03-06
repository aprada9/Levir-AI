# SearxNG Deployment Guide for Render

This guide provides step-by-step instructions to deploy SearxNG on Render for use with Levir AI.

## Understanding SearxNG Deployment

SearxNG is a critical component of Levir AI that provides the search functionality. In the local development environment, it runs as a Docker container, but for production deployment on Render, we need to set it up as a separate web service.

## Deployment Steps

### Step 1: Create a New Web Service on Render

1. Log in to your [Render dashboard](https://dashboard.render.com/)
2. Click on "New" and select "Web Service"
3. Connect to your GitHub repository
4. Configure the service as follows:
   - **Name**: `levir-ai-searxng` (or your preferred name)
   - **Environment**: `Docker`
   - **Root Directory**: (leave empty to use repository root)
   - **Dockerfile Path**: `Dockerfile.searxng`
   - **Docker Command**: (leave empty to use container's default command)

### Step 2: Configure Environment Variables

Add these environment variables in your Render SearxNG service:

- `SEARXNG_SECRET`: Generate a random string or use Render's "Generate Value" feature
- `BASE_URL`: The URL where SearxNG will be accessible (e.g., `https://levir-ai-searxng.onrender.com`)
- `INSTANCE_NAME`: A display name for your SearxNG instance (e.g., `Levir AI Search`)

### Step 3: Configure Backend Integration

After SearxNG is deployed, you need to update your backend service to use it:

1. Go to your backend service in Render
2. Add/update the environment variable:
   - `SEARXNG_API_URL`: Set to the URL of your deployed SearxNG instance (e.g., `https://levir-ai-searxng.onrender.com`)

## Verification and Testing

After deployment, verify that SearxNG is working properly:

1. Visit your SearxNG URL directly (e.g., `https://levir-ai-searxng.onrender.com`)
2. Try a simple search to confirm it returns results
3. Check if your backend can connect to SearxNG by testing the search functionality in your Levir AI application

## Troubleshooting

### Common Issues

1. **SearxNG not starting**: Check Render logs for error messages
2. **Backend can't connect to SearxNG**: Verify the `SEARXNG_API_URL` value and ensure SearxNG is accessible
3. **CORS Issues**: If your backend can't query SearxNG due to CORS, update the SearxNG settings or add CORS headers in your backend code

### Configuration File Issues

If you need to modify the SearxNG configuration:

1. Update the `settings.yml` file in the `searxng` directory
2. Redeploy the SearxNG service

## Advanced Configuration

### Customizing SearxNG

To customize SearxNG further:

1. Modify the `settings.yml` file to change settings like:
   - Enabled search engines
   - UI appearance
   - Autocomplete behavior
   - Result filtering

2. Redeploy the service to apply changes

### Performance Optimization

For better performance:

1. Consider upgrading your Render plan for more resources
2. Enable caching in SearxNG settings
3. Optimize the number of search engines enabled

## Security Considerations

1. Always use a strong, unique `SEARXNG_SECRET` value
2. Consider IP rate limiting to prevent abuse
3. Use HTTPS for all connections (Render provides this by default)

## Maintenance

Regularly check for:

1. SearxNG updates (update the Docker image tag in your Dockerfile)
2. Performance issues in Render logs
3. Search engine changes that might affect results 