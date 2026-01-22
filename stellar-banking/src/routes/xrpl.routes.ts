import { Router, Request, Response, NextFunction } from 'express';
import xrplService from '../services/xrpl.service';
import { ValidationError } from '../utils/errors';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /api/xrpl/account/:address
 * Get XRPL account information
 */
router.get('/account/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const account = await xrplService.getAccount(address);

    res.json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/xrpl/wallet/create
 * Create a new XRPL wallet
 */
router.post('/wallet/create', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = xrplService.createWallet();

    res.json({
      success: true,
      data: {
        address: wallet.address,
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
        seed: wallet.seed,
        message: 'IMPORTANT: Store these credentials securely. They cannot be recovered!',
      },
    });

    logger.info('New XRPL wallet created', {
      address: wallet.address,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/xrpl/balance/:address
 * Get XRPL account balance
 */
router.get('/balance/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const balance = await xrplService.getBalance(address);

    res.json({
      success: true,
      data: {
        address,
        balance,
        currency: 'XRP',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/xrpl/transactions/:address
 * Get XRPL transaction history
 */
router.get('/transactions/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    if (limit < 1 || limit > 200) {
      throw new ValidationError('Limit must be between 1 and 200');
    }

    const transactions = await xrplService.getTransactions(address, limit);

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
