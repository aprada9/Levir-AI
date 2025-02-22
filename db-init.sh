#!/bin/bash

# Wait for the database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Apply migrations
echo "Applying database migrations..."
supabase db reset

# Deploy edge functions
echo "Deploying edge functions..."
supabase functions deploy process-ocr

echo "Database initialization complete!" 