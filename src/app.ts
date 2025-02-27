import { startWebSocketServer } from './websocket';
import express from 'express';
import cors from 'cors';
import http from 'http';
import routes from './routes';
import { getPort } from './config';
import logger from './utils/logger';
import { createClient } from '@supabase/supabase-js';

const port = getPort();

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: '*',
};

// Authentication middleware
const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Allow the request to continue without authentication
    return next();
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Verify the JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      logger.warn(`Invalid auth token: ${error?.message}`);
      return next();
    }
    
    // Attach the user to the request object
    (req as any).user = user;
    logger.info(`Authenticated user: ${user.id}`);
    
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error}`);
    next();
  }
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(authMiddleware); // Add authentication middleware

app.use('/api', routes);
app.get('/api', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

server.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

startWebSocketServer(server);

process.on('uncaughtException', (err, origin) => {
  logger.error(`Uncaught Exception at ${origin}: ${err}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});
