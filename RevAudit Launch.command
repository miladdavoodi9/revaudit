#!/bin/bash
cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Open browser after short delay
(sleep 3 && open http://localhost:3000) &

# Start the app
npm run dev
