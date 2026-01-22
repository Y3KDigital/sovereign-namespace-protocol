import { Router, Request, Response, NextFunction } from 'express';
import stellarService from '../services/stellar.service';
import { ValidationError } from '../utils/errors';
import Joi from 'joi';
import logger from '../utils/logger';

const router = Router();

/**
 * Payment request validation schema
 */
const paymentSchema = Joi.object({
  sourceSecret: Joi.string().required(),
  destinationId: Joi.string().required(),
  amount: Joi.string().required(),
  assetCode: Joi.string().optional(),
  assetIssuer: Joi.string().optional(),
  memo: Joi.string().optional(),
});

/**
 * POST /api/payments/send
 * Send a payment on Stellar network
 */
router.post('/send', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = paymentSchema.validate(req.body);

    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { destinationId, amount, assetCode, assetIssuer } = value;

    // Import keypair from secret
    const sourceKeypair = stellarService['createKeypair']();
    
    // Note: In production, use proper key management
    const transaction = await stellarService.buildPaymentTransaction(
      sourceKeypair,
      destinationId,
      amount,
      assetCode,
      assetIssuer
    );

    const result = await stellarService.submitTransaction(transaction);

    res.json({
      success: true,
      data: {
        hash: result.hash,
        ledger: result.ledger,
      },
    });

    logger.info('Payment sent successfully', {
      hash: result.hash,
      destination: destinationId,
      amount,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/payments/:accountId
 * Get payment history for an account
 */
router.get('/:accountId', async (req: Request, res: Response, next: NextFunction) => {
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
