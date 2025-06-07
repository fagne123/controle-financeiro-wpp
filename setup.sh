#!/bin/bash

# Setup script for the Financial Tracker application

echo "Setting up Financial Tracker application..."

# Install dependencies
echo "\nInstalling dependencies..."
npm install

# Create the .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "\nCreating .env file..."
    cp .env.example .env
    # Generate a random JWT secret
    JWT_SECRET=$(openssl rand -hex 32)
    # Replace the placeholder with the generated secret
    sed -i "s/your_jwt_secret_key_here/$JWT_SECRET/g" .env
    echo "JWT_SECRET generated."
fi

# Seed the database with initial admin user
echo "\nSeeding database with initial admin user..."
npm run seed

# Start the application in development mode
echo "\nStarting the application in development mode..."
echo "Access the application at http://localhost:3000"
echo "Use the admin credentials shown above to login.\n"

npm run dev
