// keepalive.js - Script to prevent Render services from sleeping
const https = require('https');
const http = require('http');

// Configuration
const SERVICES = [
  {
    name: 'SearxNG Service',
    url: process.env.SEARXNG_URL || 'https://your-searxng-service-url.onrender.com/healthz',
    interval: 10 * 60 * 1000, // 10 minutes
  },
  {
    name: 'Backend Service',
    url: process.env.BACKEND_URL || 'https://your-backend-service-url.onrender.com/api',
    interval: 10 * 60 * 1000, // 10 minutes
  }
];

// Function to ping a service
function pingService(service) {
  console.log(`Pinging ${service.name} at ${new Date().toISOString()}`);
  
  const client = service.url.startsWith('https') ? https : http;
  
  const req = client.get(service.url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`${service.name} responded with status: ${res.statusCode}`);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          console.log(`Response data: ${JSON.stringify(parsed)}`);
        } catch (e) {
          console.log(`Response: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`);
        }
      }
    });
  });
  
  req.on('error', (error) => {
    console.error(`Error pinging ${service.name}: ${error.message}`);
  });
  
  req.end();
}

// Set up the ping intervals for each service
SERVICES.forEach(service => {
  console.log(`Setting up ping for ${service.name} every ${service.interval / 1000 / 60} minutes`);
  
  // Initial ping
  pingService(service);
  
  // Schedule regular pings
  setInterval(() => {
    pingService(service);
  }, service.interval);
});

// Keep the process alive
console.log('Keepalive service started'); 