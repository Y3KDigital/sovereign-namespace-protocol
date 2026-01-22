/**
 * Environment configuration interface
 */
export interface Config {
  nodeEnv: string;
  port: number;
  logLevel: string;
  stellar: StellarConfig;
  xrpl: XRPLConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  api: ApiConfig;
  security: SecurityConfig;
  bridge: BridgeConfig;
  monitoring: MonitoringConfig;
}

export interface StellarConfig {
  network: 'testnet' | 'public';
  horizonUrl: string;
  passphrase: string;
}

export interface XRPLConfig {
  network: 'testnet' | 'mainnet' | 'devnet';
  server: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

export interface ApiConfig {
  rateLimit: number;
  rateWindow: number;
}

export interface SecurityConfig {
  jwtSecret: string;
  encryptionKey: string;
}

export interface BridgeConfig {
  enabled: boolean;
  minAmount: number;
  feePercent: number;
}

export interface MonitoringConfig {
  enableMetrics: boolean;
  metricsPort: number;
}

/**
 * Load and validate configuration from environment variables
 */
export const loadConfig = (): Config => {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    logLevel: process.env.LOG_LEVEL || 'info',
    stellar: {
      network: (process.env.STELLAR_NETWORK as 'testnet' | 'public') || 'testnet',
      horizonUrl: process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
      passphrase: process.env.STELLAR_PASSPHRASE || 'Test SDF Network ; September 2015',
    },
    xrpl: {
      network: (process.env.XRPL_NETWORK as 'testnet' | 'mainnet' | 'devnet') || 'testnet',
      server: process.env.XRPL_SERVER || 'wss://s.altnet.rippletest.net:51233',
    },
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      name: process.env.DB_NAME || 'digital_giant_stellar',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
    },
    api: {
      rateLimit: parseInt(process.env.API_RATE_LIMIT || '100', 10),
      rateWindow: parseInt(process.env.API_RATE_WINDOW || '900000', 10),
    },
    security: {
      jwtSecret: process.env.JWT_SECRET || 'change_me_in_production',
      encryptionKey: process.env.ENCRYPTION_KEY || 'change_me_in_production',
    },
    bridge: {
      enabled: process.env.BRIDGE_ENABLED === 'true',
      minAmount: parseFloat(process.env.BRIDGE_MIN_AMOUNT || '1'),
      feePercent: parseFloat(process.env.BRIDGE_FEE_PERCENT || '0.5'),
    },
    monitoring: {
      enableMetrics: process.env.ENABLE_METRICS === 'true',
      metricsPort: parseInt(process.env.METRICS_PORT || '9090', 10),
    },
  };
};

export default loadConfig();
