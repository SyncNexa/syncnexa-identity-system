#!/bin/sh
set -e

echo "Starting SyncNexa Identity System..."

# Run database migrations
echo "Running database migrations..."
if [ "$NODE_ENV" = "production" ]; then
  node dist/migrate.js
else
  npm run migrate:dev
fi

echo "Migrations completed successfully"

# Start the application
echo "Starting server..."
if [ "$NODE_ENV" = "production" ]; then
  exec node dist/server.js
else
  exec npm run dev
fi
