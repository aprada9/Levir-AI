// keepalive.js - Script to prevent Render services from sleeping
const https = require('https');
const http = require('http');

// Configuration
const SERVICES = [
  {
    name: 'SearxNG Service',
    url: process.env.SEARXNG_URL || 'https://your-searxng-service-url.onrender.com/healthz',
    interval: 5 * 60 * 1000, // 5 minutes instead of 10
  },
  {
    name: 'Backend Service',
    url: process.env.BACKEND_URL || 'https://your-backend-service-url.onrender.com/api',
    interval: 5 * 60 * 1000, // 5 minutes instead of 10
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

// Create a simple HTTP server for Render to detect an open port
const PORT = process.env.PORT || 10000;
const server = http.createServer((req, res) => {
  const pingHistory = SERVICES.map(service => `${service.name}: Pinging every ${service.interval/1000/60} minutes`);
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'Keepalive service running',
    services: SERVICES.map(s => s.name),
    pingFrequency: `${SERVICES[0].interval/1000/60} minutes`,
    pingHistory: pingHistory
  }));
});

server.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

// Keep the process alive
console.log('Keepalive service started'); 