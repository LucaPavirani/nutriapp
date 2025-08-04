import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://neondb_owner:npg_PwKSlOBhr7F1@ep-late-bird-a22iopjq-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
) 