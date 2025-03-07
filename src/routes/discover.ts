import express from 'express';
import { searchSearxng } from '../lib/searxng';
import logger from '../utils/logger';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Get user's preferred language from Accept-Language header
    const acceptLanguage = req.headers['accept-language'] || '';
    
    // Parse the Accept-Language header to extract the preferred language
    // Example: 'en-US,en;q=0.9,es;q=0.8' -> 'en'
    const preferredLanguage = acceptLanguage.split(',')[0]?.split(';')[0]?.split('-')[0] || 'en';
    
    // Get client's IP address (for geolocation-based results)
    // Try to get the original client IP from various headers that might be set by proxies
    const clientIp = 
      req.headers['x-forwarded-for']?.toString().split(',')[0] || 
      req.headers['x-real-ip'] || 
      req.connection.remoteAddress || 
      '';
    
    // Log the information being used
    logger.info(`Discover request - Language: ${preferredLanguage}, IP: ${clientIp}`);
    
    // Set search parameters with both language and region info
    const searchParams = {
      engines: ['bing news'],
      pageno: 1,
      language: preferredLanguage,
    };
    
    // If we have client IP, we can add geolocation-based parameters that SearxNG might support
    // Note: This depends on the SearxNG configuration, but most implementations respect these parameters
    
    const data = (
      await Promise.all([
        searchSearxng('site:businessinsider.com AI', searchParams),
        searchSearxng('site:www.exchangewire.com AI', searchParams),
        searchSearxng('site:yahoo.com AI', searchParams),
        searchSearxng('site:businessinsider.com tech', searchParams),
        searchSearxng('site:www.exchangewire.com tech', searchParams),
        searchSearxng('site:yahoo.com tech', searchParams),
      ])
    )
      .map((result) => result.results)
      .flat()
      .sort(() => Math.random() - 0.5);

    return res.json({ blogs: data });
  } catch (err: any) {
    logger.error(`Error in discover route: ${err.message}`);
    return res.status(500).json({ message: 'An error has occurred' });
  }
});

export default router;
