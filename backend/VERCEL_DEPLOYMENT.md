# Deploying NutriApp Backend to Vercel

This guide explains how to deploy the NutriApp backend to Vercel.

## Prerequisites

- A Vercel account
- Git repository with your code
- PostgreSQL database (e.g., Neon, Supabase, etc.)

## Deployment Steps

1. **Install Vercel CLI** (optional but helpful for testing)
   ```
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```
   vercel login
   ```

3. **Deploy to Vercel**
   ```
   # Navigate to the backend directory
   cd /path/to/nutriapp/backend
   
   # Deploy
   vercel
   ```

   Or deploy directly from the Vercel dashboard by connecting your GitHub repository.

4. **Environment Variables**
   
   Make sure to set the following environment variable in your Vercel project settings:
   
   - `DATABASE_URL`: Your PostgreSQL connection string

## Project Structure

The project has been configured for Vercel deployment with:

- `vercel.json`: Configuration file for Vercel
- `api/index.py`: Serverless function entry point
- Updated CORS settings in `main.py`

## Testing the Deployment

After deployment, you can test your API using:

```
curl https://your-vercel-app-url.vercel.app/health
```

## Troubleshooting

- If you encounter database connection issues, make sure your database allows connections from Vercel's IP addresses
- Check Vercel logs for any errors
- Ensure your `requirements.txt` includes all necessary dependencies
