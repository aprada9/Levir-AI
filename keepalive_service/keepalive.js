// keepalive.js - Script to prevent Render services from sleeping
const https = require('https');
const http = require('http');

// Configuration
const SERVICES = [
  {
    name: 'SearxNG Service',
    url: process.env.SEARXNG_URL || 'https://levir-ai-searxng.onrender.com/',
    interval: 5 * 60 * 1000, // 5 minutes
    verifyResponse: (data) => {
      try {
        return data && data.length > 0;
      } catch (e) {
        return false;
      }
    }
  },
  {
    name: 'Backend Service',
    url: process.env.BACKEND_URL || 'https://levir-ai-backend.onrender.com/api/',
    interval: 5 * 60 * 1000, // 5 minutes
    verifyResponse: (data) => {
      try {
        const parsed = JSON.parse(data);
        return parsed.status === 'ok' || parsed.status === 'alive';
      } catch (e) {
        return false;
      }
    }
  }
];

// Function to ping a service
function pingService(service) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Pinging ${service.name}`);
  
  return new Promise((resolve, reject) => {
    const client = service.url.startsWith('https') ? https : http;
    
    const req = client.get(service.url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const isSuccess = res.statusCode === 200 && service.verifyResponse(data);
        console.log(`[${timestamp}] ${service.name} responded with status: ${res.statusCode}, Success: ${isSuccess}`);
        
        if (data) {
          try {
            const parsed = JSON.parse(data);
            console.log(`[${timestamp}] Response data: ${JSON.stringify(parsed)}`);
          } catch (e) {
            console.log(`[${timestamp}] Response: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`);
          }
        }
        
        if (isSuccess) {
          resolve(true);
        } else {
          reject(new Error(`Service check failed for ${service.name}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`[${timestamp}] Error pinging ${service.name}: ${error.message}`);
      reject(error);
    });
    
    // Set a timeout of 30 seconds
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error(`Timeout pinging ${service.name}`));
    });
    
    req.end();
  });
}

// Function to ping all services
async function pingAllServices() {
  for (const service of SERVICES) {
    try {
      await pingService(service);
    } catch (error) {
      console.error(`Failed to ping ${service.name}: ${error.message}`);
      // Try again after 30 seconds if failed
      setTimeout(() => pingService(service), 30000);
    }
  }
}

// Set up the ping intervals for each service
console.log('Starting keepalive service...');
SERVICES.forEach(service => {
  console.log(`Setting up ping for ${service.name} every ${service.interval / 1000 / 60} minutes`);
});

// Initial ping
pingAllServices();

// Schedule regular pings
setInterval(pingAllServices, Math.min(...SERVICES.map(s => s.interval)));

// Create a simple HTTP server that also acts as a status page
const PORT = process.env.PORT || 10000;
const server = http.createServer((req, res) => {
  const status = {
    status: 'Keepalive service running',
    uptime: process.uptime(),
    services: SERVICES.map(s => ({
      name: s.name,
      url: s.url,
      pingFrequency: `${s.interval/1000/60} minutes`
    })),
    lastCheck: new Date().toISOString()
  };
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(status, null, 2));
});

server.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
  console.log('Keepalive service started');
});

// Keep the process alive and handle errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
}); 