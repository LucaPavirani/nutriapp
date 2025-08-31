from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import sys
import os

# Add the parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the FastAPI app from main.py
from main import app as main_app

# Create a new app for Vercel
app = main_app

# Handle CORS preflight requests
@app.options("/{rest_of_path:path}")
async def preflight_handler(request: Request, rest_of_path: str):
    response = JSONResponse(content={})
    return response

# This is required for Vercel serverless deployment
handler = app
