# Vercel Deployment Configuration

This document outlines the deployment configuration for the Beetals Insurance Claim Evaluator System on Vercel.

## Environment Variables

The following environment variables need to be configured in your Vercel dashboard:

### Required Variables:
- `NODE_ENV`: Set to 'production' for deployment
- `PORT`: Vercel will handle this automatically
- `PERPLEXITY_API_KEY`: Your Perplexity AI API key

### How to Configure:

1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable with its corresponding value:
   - Name: `NODE_ENV`
     Value: `production`
   - Name: `PERPLEXITY_API_KEY`
     Value: `your_perplexity_api_key_here`

⚠️ Important: Never commit actual API keys or secrets to the repository. Always use environment variables for sensitive data.

## Deployment Structure

The project is configured for full-stack deployment on Vercel:

✅ Backend Configuration:
- Entry point: `server/index.ts`
- Handles all `/api/*` routes
- Configured in `vercel.json`

✅ Frontend Configuration:
- Static files served from: `dist/public/`
- Built with Vite
- Optimized for production

✅ Full-Stack Integration:
- Seamless frontend and backend deployment
- Automatic HTTPS/SSL
- Edge network distribution

## Verify Deployment

After deploying, verify that:
1. Frontend is accessible and loading correctly
2. API endpoints are responding
3. Environment variables are working (test the Perplexity AI integration)
4. File uploads and processing are functioning

## Troubleshooting

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Ensure all API endpoints are properly configured in `vercel.json`
4. Check for any CORS or API routing issues
