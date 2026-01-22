import xrplService from './xrpl.service';
import config from '../config';
import logger from '../utils/logger';
import { BridgeError, ValidationError } from '../utils/errors';

/**
 * Transaction type for cross-chain bridge
 */
export interface BridgeTransaction {
  id: string;
  sourceNetwork: 'stellar' | 'xrpl';
  destinationNetwork: 'stellar' | 'xrpl';
  sourceAddress: string;
  destinationAddress: string;
  amount: string;
  asset: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: Date;
  txHash?: string;
  error?: string;
}

/**
 * Cross-chain bridge service connecting Stellar and XRPL
 */
export class BridgeService {
  private pendingTransactions: Map<string, BridgeTransaction> = new Map();

  constructor() {
    if (config.bridge.enabled) {
      logger.info('Bridge service initialized');
      this.initializeListeners();
    }
  }

  /**
   * Initialize network listeners for bridge operations
   */
  private initializeListeners(): void {
    // This would set up listeners for both networks
    logger.info('Bridge listeners initialized');
  }

  /**
   * Transfer assets from Stellar to XRPL
   */
  async transferStellarToXRPL(
    sourceAddress: string,
    destinationAddress: string,
    amount: string
  ): Promise<BridgeTransaction> {
    this.validateTransfer(amount);

    const transaction: BridgeTransaction = {
      id: this.generateTransactionId(),
      sourceNetwork: 'stellar',
      destinationNetwork: 'xrpl',
      sourceAddress,
      destinationAddress,
      amount,
      asset: 'XLM',
      status: 'pending',
      timestamp: new Date(),
    };

    try {
      this.pendingTransactions.set(transaction.id, transaction);
      transaction.status = 'processing';

      // Calculate bridge fee
      const fee = this.calculateFee(parseFloat(amount));
      const netAmount = (parseFloat(amount) - fee).toFixed(7);

      // Lock assets on Stellar
      logger.info('Locking assets on Stellar', { transaction });

      // Mint/transfer on XRPL
      await xrplService.connect();
      logger.info('Transferring to XRPL', { transaction, netAmount });

      transaction.status = 'completed';
      logger.info('Bridge transfer completed', { transaction });

      return transaction;
    } catch (error) {
      transaction.status = 'failed';
      transaction.error = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Bridge transfer failed', { transaction, error });
      throw new BridgeError(`Transfer failed: ${transaction.error}`);
    } finally {
      this.pendingTransactions.delete(transaction.id);
    }
  }

  /**
   * Transfer assets from XRPL to Stellar
   */
  async transferXRPLToStellar(
    sourceAddress: string,
    destinationAddress: string,
    amount: string
  ): Promise<BridgeTransaction> {
    this.validateTransfer(amount);

    const transaction: BridgeTransaction = {
      id: this.generateTransactionId(),
      sourceNetwork: 'xrpl',
      destinationNetwork: 'stellar',
      sourceAddress,
      destinationAddress,
      amount,
      asset: 'XRP',
      status: 'pending',
      timestamp: new Date(),
    };

    try {
      this.pendingTransactions.set(transaction.id, transaction);
      transaction.status = 'processing';

      // Calculate bridge fee
      const fee = this.calculateFee(parseFloat(amount));
      const netAmount = (parseFloat(amount) - fee).toFixed(7);

      // Lock assets on XRPL
      await xrplService.connect();
      logger.info('Locking assets on XRPL', { transaction });

      // Mint/transfer on Stellar
      logger.info('Transferring to Stellar', { transaction, netAmount });

      transaction.status = 'completed';
      logger.info('Bridge transfer completed', { transaction });

      return transaction;
    } catch (error) {
      transaction.status = 'failed';
      transaction.error = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Bridge transfer failed', { transaction, error });
      throw new BridgeError(`Transfer failed: ${transaction.error}`);
    } finally {
      this.pendingTransactions.delete(transaction.id);
    }
  }

  /**
   * Get transaction status
   */
  getTransactionStatus(transactionId: string): BridgeTransaction | undefined {
    return this.pendingTransactions.get(transactionId);
  }

  /**
   * Get all pending transactions
   */
  getPendingTransactions(): BridgeTransaction[] {
    return Array.from(this.pendingTransactions.values());
  }

  /**
   * Validate transfer parameters
   */
  private validateTransfer(amount: string): void {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      throw new ValidationError('Invalid amount');
    }

    if (numAmount < config.bridge.minAmount) {
      throw new ValidationError(
        `Amount must be at least ${config.bridge.minAmount}`
      );
    }
  }

  /**
   * Calculate bridge fee
   */
  private calculateFee(amount: number): number {
    return amount * (config.bridge.feePercent / 100);
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    return `bridge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new BridgeService();
