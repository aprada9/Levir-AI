#!/bin/bash

# Build the TypeScript project
npm install
npm run build

# Copy the config.toml file to the destination that Render expects
mkdir -p /opt/render/project/src/
cp ./config.toml.prod /opt/render/project/src/config.toml

# Ensure the file exists and has the right permissions
chmod 644 /opt/render/project/src/config.toml

echo "Build completed successfully with config.toml copied to /opt/render/project/src/" 