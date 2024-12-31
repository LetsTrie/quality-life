#!/bin/bash

# Define log function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log "Script execution started."

rm -rf server

# Step 1: Remove existing 'quality-life' directory if present
if [ -d "quality-life" ]; then
    log "Removing existing 'quality-life' directory..."
    rm -rf quality-life
    log "Existing 'quality-life' directory removed."
else
    log "No existing 'quality-life' directory found."
fi

# Step 2: Clone the repository
log "Cloning the repository from https://github.com/LetsTrie/quality-life.git..."
if git clone https://github.com/LetsTrie/quality-life.git; then
    log "Repository successfully cloned."
else
    log "Failed to clone repository. Exiting script."
    exit 1
fi

# Step 3: Move the 'backend' directory to 'server'
log "Renaming 'backend' directory to 'server'..."
if mv quality-life/backend server; then
    log "'backend' directory successfully renamed to 'server'."
else
    log "Failed to rename 'backend' directory. Exiting script."
    exit 1
fi

# Step 4: Clean up by removing 'quality-life' directory
log "Cleaning up by removing 'quality-life' directory..."
if rm -rf quality-life; then
    log "'quality-life' directory successfully removed."
else
    log "Failed to remove 'quality-life' directory. Exiting script."
    exit 1
fi

if cp .env server/.env; then
    log "Environment variables successfully copied to server/.env."
else
    log "Failed to copy environment variables to server/.env. Exiting script."
    exit 1
fi

if cd server && npm install; then
    log "Server installation successful."
else
    log "Failed to install server dependencies. Exiting script."
    exit 1
fi

if pm2 restart all; then 
    log "Server instances restarted successfully."
else
    log "Failed to restart all server instances. Exiting script."
    exit 1
fi

log "Starting server... 

log "Script execution completed successfully."
