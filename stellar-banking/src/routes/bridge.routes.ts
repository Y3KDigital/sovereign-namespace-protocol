import { Router, Request, Response, NextFunction } from 'express';
import bridgeService from '../services/bridge.service';
import { ValidationError } from '../utils/errors';
import Joi from 'joi';
import logger from '../utils/logger';

const router = Router();

/**
 * Bridge transfer validation schema
 */
const transferSchema = Joi.object({
  sourceAddress: Joi.string().required(),
  destinationAddress: Joi.string().required(),
  amount: Joi.string().required(),
  direction: Joi.string().valid('stellar-to-xrpl', 'xrpl-to-stellar').required(),
});

/**
 * POST /api/bridge/transfer
 * Initiate a cross-chain bridge transfer
 */
router.post('/transfer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = transferSchema.validate(req.body);

    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { sourceAddress, destinationAddress, amount, direction } = value;

    let transaction;
    if (direction === 'stellar-to-xrpl') {
      transaction = await bridgeService.transferStellarToXRPL(
        sourceAddress,
        destinationAddress,
        amount
      );
    } else {
      transaction = await bridgeService.transferXRPLToStellar(
        sourceAddress,
        destinationAddress,
        amount
      );
    }

    res.json({
      success: true,
      data: transaction,
    });

    logger.info('Bridge transfer initiated', {
      transactionId: transaction.id,
      direction,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/bridge/status/:transactionId
 * Get bridge transaction status
 */
router.get('/status/:transactionId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transactionId } = req.params;
    const transaction = bridgeService.getTransactionStatus(transactionId);

    if (!transaction) {
      throw new ValidationError('Transaction not found');
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/bridge/pending
 * Get all pending bridge transactions
 */
router.get('/pending', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const transactions = bridgeService.getPendingTransactions();

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
