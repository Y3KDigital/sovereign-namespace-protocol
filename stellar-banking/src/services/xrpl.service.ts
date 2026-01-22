import { Client, Wallet, xrpToDrops, dropsToXrp } from 'xrpl';
import config from '../config';
import logger from '../utils/logger';
import { NetworkError } from '../utils/errors';

/**
 * XRPL network service for interacting with XRP Ledger
 */
export class XRPLService {
  private client: Client;
  private isConnected: boolean = false;

  constructor() {
    this.client = new Client(config.xrpl.server);
    logger.info(`XRPL service initialized on ${config.xrpl.network} network`);
  }

  /**
   * Connect to XRPL network
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      await this.client.connect();
      this.isConnected = true;
      logger.info('Connected to XRPL network');
    } catch (error) {
      logger.error('Failed to connect to XRPL', { error });
      throw new NetworkError('Failed to connect to XRPL network', 'xrpl');
    }
  }

  /**
   * Disconnect from XRPL network
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.client.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from XRPL network');
    } catch (error) {
      logger.error('Failed to disconnect from XRPL', { error });
    }
  }

  /**
   * Get account information
   */
  async getAccount(address: string) {
    await this.ensureConnected();

    try {
      const response = await this.client.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated',
      });

      return response.result.account_data;
    } catch (error) {
      logger.error('Failed to get XRPL account', { address, error });
      throw new NetworkError('Failed to get XRPL account', 'xrpl');
    }
  }

  /**
   * Create a new XRPL wallet
   */
  createWallet(): Wallet {
    return Wallet.generate();
  }

  /**
   * Send XRP payment
   */
  async sendPayment(
    sourceWallet: Wallet,
    destinationAddress: string,
    amount: string
  ) {
    await this.ensureConnected();

    try {
      const prepared = await this.client.autofill({
        TransactionType: 'Payment',
        Account: sourceWallet.address,
        Amount: xrpToDrops(amount),
        Destination: destinationAddress,
      });

      const signed = sourceWallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      logger.info('XRPL payment sent', {
        hash: result.result.hash,
        validated: result.result.validated,
      });

      return result;
    } catch (error) {
      logger.error('Failed to send XRPL payment', { error });
      throw new NetworkError('Failed to send XRPL payment', 'xrpl');
    }
  }

  /**
   * Get account balance
   */
  async getBalance(address: string): Promise<string> {
    await this.ensureConnected();

    try {
      const account = await this.getAccount(address);
      return dropsToXrp(account.Balance);
    } catch (error) {
      logger.error('Failed to get XRPL balance', { address, error });
      throw new NetworkError('Failed to get XRPL balance', 'xrpl');
    }
  }

  /**
   * Get account transactions
   */
  async getTransactions(address: string, limit: number = 10) {
    await this.ensureConnected();

    try {
      const response = await this.client.request({
        command: 'account_tx',
        account: address,
        limit: limit,
      });

      return response.result.transactions;
    } catch (error) {
      logger.error('Failed to get XRPL transactions', { address, error });
      throw new NetworkError('Failed to get XRPL transactions', 'xrpl');
    }
  }

  /**
   * Subscribe to account transactions
   */
  async subscribeToAccount(
    address: string,
    onTransaction: (transaction: any) => void
  ) {
    await this.ensureConnected();

    try {
      await this.client.request({
        command: 'subscribe',
        accounts: [address],
      });

      this.client.on('transaction', (transaction) => {
        const tx = transaction.transaction as any;
        if (
          tx.Account === address ||
          tx.Destination === address
        ) {
          onTransaction(transaction);
        }
      });

      logger.info('Subscribed to XRPL account', { address });
    } catch (error) {
      logger.error('Failed to subscribe to XRPL account', { address, error });
      throw new NetworkError('Failed to subscribe to XRPL account', 'xrpl');
    }
  }

  /**
   * Ensure client is connected
   */
  private async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  /**
   * Utility: Convert XRP to drops
   */
  xrpToDrops(xrp: string): string {
    return xrpToDrops(xrp);
  }

  /**
   * Utility: Convert drops to XRP
   */
  dropsToXrp(drops: string): string {
    return dropsToXrp(drops);
  }
}

export default new XRPLService();
