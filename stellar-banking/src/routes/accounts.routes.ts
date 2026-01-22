import { Router, Request, Response, NextFunction } from 'express';
import stellarService from '../services/stellar.service';
import { ValidationError } from '../utils/errors';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /api/accounts/:accountId
 * Get Stellar account information
 */
router.get('/:accountId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountId } = req.params;
    const account = await stellarService.getAccount(accountId);

    res.json({
      success: true,
      data: {
        id: account.id,
        sequence: account.sequence,
        balances: account.balances,
        subentryCount: account.subentry_count,
        thresholds: account.thresholds,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/accounts/create
 * Create a new Stellar account
 */
router.post('/create', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const keypair = stellarService.createKeypair();

    res.json({
      success: true,
      data: {
        publicKey: keypair.publicKey(),
        secret: keypair.secret(),
        message: 'IMPORTANT: Store the secret key securely. It cannot be recovered!',
      },
    });

    logger.info('New Stellar account created', {
      publicKey: keypair.publicKey(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/accounts/:accountId/balances
 * Get account balances
 */
router.get('/:accountId/balances', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountId } = req.params;
    const balances = await stellarService.getBalances(accountId);

    res.json({
      success: true,
      data: balances,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/accounts/:accountId/transactions
 * Get account transaction history
 */
router.get('/:accountId/transactions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    if (limit < 1 || limit > 200) {
      throw new ValidationError('Limit must be between 1 and 200');
    }

    const transactions = await stellarService.getTransactions(accountId, limit);

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
