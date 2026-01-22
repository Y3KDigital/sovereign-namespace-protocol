import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import config from './config';
import logger from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { rateLimitMiddleware } from './middleware/rateLimit.middleware';

// Routes
import accountsRoutes from './routes/accounts.routes';
import paymentsRoutes from './routes/payments.routes';
import bridgeRoutes from './routes/bridge.routes';
import xrplRoutes from './routes/xrpl.routes';
import tokensRoutes from './routes/tokens.routes';

// Load environment variables
dotenv.config();

/**
 * Main application class
 */
class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize middlewares
   */
  private initializeMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(rateLimitMiddleware);

    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Digital Giant Stellar Infrastructure',
      });
    });
  }

  /**
   * Initialize routes
   */
  private initializeRoutes(): void {
    this.app.use('/api/accounts', accountsRoutes);
    this.app.use('/api/payments', paymentsRoutes);
    this.app.use('/api/bridge', bridgeRoutes);
    this.app.use('/api/tokens', tokensRoutes);
    this.app.use('/api/xrpl', xrplRoutes);
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  public listen(): void {
    this.app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Stellar Network: ${config.stellar.network}`);
      logger.info(`XRPL Network: ${config.xrpl.network}`);
      logger.info(`Bridge Enabled: ${config.bridge.enabled}`);
    });
  }
}

export default App;
