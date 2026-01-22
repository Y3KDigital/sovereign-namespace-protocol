import * as StellarSdk from '@stellar/stellar-sdk';
import config from '../config';
import logger from '../utils/logger';
import { NetworkError } from '../utils/errors';

/**
 * Stellar network service for interacting with Stellar blockchain
 */
export class StellarService {
  private server: StellarSdk.Horizon.Server;
  private network: StellarSdk.Networks;

  constructor() {
    this.server = new StellarSdk.Horizon.Server(
      config.stellar.horizonUrl,
      { allowHttp: true }
    );
    this.network =
      config.stellar.network === 'public'
        ? StellarSdk.Networks.PUBLIC
        : StellarSdk.Networks.TESTNET;

    logger.info(
      `Stellar service initialized on ${config.stellar.network} network (allowHttp: true)`
    );
  }

  /**
   * Get account information
   */
  async getAccount(accountId: string): Promise<StellarSdk.Horizon.AccountResponse> {
    try {
      return await this.server.loadAccount(accountId);
    } catch (error) {
      logger.error('Failed to load Stellar account', { accountId, error });
      throw new NetworkError('Failed to load Stellar account', 'stellar');
    }
  }

  /**
   * Create a new Stellar account
   */
  createKeypair(): StellarSdk.Keypair {
    return StellarSdk.Keypair.random();
  }

  /**
   * Submit a transaction to the Stellar network
   */
  async submitTransaction(
    transaction: StellarSdk.Transaction
  ): Promise<StellarSdk.Horizon.HorizonApi.SubmitTransactionResponse> {
    try {
      const result = await this.server.submitTransaction(transaction);
      logger.info('Transaction submitted successfully', {
        hash: result.hash,
      });
      return result;
    } catch (error) {
      logger.error('Failed to submit transaction', { error });
      throw new NetworkError('Failed to submit Stellar transaction', 'stellar');
    }
  }

  /**
   * Build a payment transaction
   */
  async buildPaymentTransaction(
    sourceKeypair: StellarSdk.Keypair,
    destinationId: string,
    amount: string,
    assetCode?: string,
    assetIssuer?: string
  ): Promise<StellarSdk.Transaction> {
    try {
      const sourceAccount = await this.getAccount(sourceKeypair.publicKey());
      
      const asset = assetCode && assetIssuer
        ? new StellarSdk.Asset(assetCode, assetIssuer)
        : StellarSdk.Asset.native();

      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: this.network,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destinationId,
            asset: asset,
            amount: amount,
          })
        )
        .setTimeout(180)
        .build();

      transaction.sign(sourceKeypair);
      return transaction;
    } catch (error) {
      logger.error('Failed to build payment transaction', { error });
      throw new NetworkError('Failed to build Stellar payment', 'stellar');
    }
  }

  /**
   * Get transaction history for an account
   */
  async getTransactions(accountId: string, limit: number = 10) {
    try {
      const transactions = await this.server
        .transactions()
        .forAccount(accountId)
        .limit(limit)
        .order('desc')
        .call();
      
      return transactions.records;
    } catch (error) {
      logger.error('Failed to get transactions', { accountId, error });
      throw new NetworkError('Failed to get Stellar transactions', 'stellar');
    }
  }

  /**
   * Stream account transactions in real-time
   */
  streamTransactions(
    accountId: string,
    onMessage: (transaction: any) => void
  ): () => void {
    const stream = this.server
      .transactions()
      .forAccount(accountId)
      .cursor('now')
      .stream({
        onmessage: onMessage,
        onerror: (error) => {
          logger.error('Transaction stream error', { error });
        },
      });

    return () => stream();
  }

  /**
   * Get account balances
   */
  async getBalances(accountId: string) {
    try {
      const account = await this.getAccount(accountId);
      return account.balances;
    } catch (error) {
      logger.error('Failed to get balances', { accountId, error });
      throw new NetworkError('Failed to get Stellar balances', 'stellar');
    }
  }
}

export default new StellarService();
