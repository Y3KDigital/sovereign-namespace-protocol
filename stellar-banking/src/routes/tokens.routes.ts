import { Router, Request, Response, NextFunction } from 'express';
import tokenMintingService from '../services/token-minting.service';
import { ValidationError } from '../utils/errors';
import Joi from 'joi';
import logger from '../utils/logger';

const router = Router();

/**
 * Token issuance validation schema
 */
const issueTokenSchema = Joi.object({
  issuerSecret: Joi.string().required(),
  assetCode: Joi.string().min(1).max(12).required(),
  description: Joi.string().required(),
  totalSupply: Joi.string().optional(),
  metadata: Joi.object({
    homepage: Joi.string().uri().optional(),
    image: Joi.string().uri().optional(),
    conditions: Joi.string().optional(),
  }).optional(),
});

/**
 * Token minting validation schema
 */
const mintTokenSchema = Joi.object({
  issuerSecret: Joi.string().required(),
  distributorPublicKey: Joi.string().required(),
  assetCode: Joi.string().min(1).max(12).required(),
  amount: Joi.string().required(),
});

/**
 * Trustline validation schema
 */
const trustlineSchema = Joi.object({
  accountSecret: Joi.string().required(),
  assetCode: Joi.string().min(1).max(12).required(),
  issuerPublicKey: Joi.string().required(),
  limit: Joi.string().optional(),
});

/**
 * Airdrop validation schema
 */
const airdropSchema = Joi.object({
  issuerSecret: Joi.string().required(),
  assetCode: Joi.string().min(1).max(12).required(),
  recipients: Joi.array()
    .items(
      Joi.object({
        address: Joi.string().required(),
        amount: Joi.string().required(),
      })
    )
    .min(1)
    .required(),
});

/**
 * POST /api/tokens/issue
 * Issue a new token/asset
 */
router.post('/issue', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = issueTokenSchema.validate(req.body);

    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { issuerSecret, assetCode, description, totalSupply, metadata } = value;

    const asset = await tokenMintingService.issueToken(
      issuerSecret,
      assetCode,
      description,
      totalSupply,
      metadata
    );

    res.json({
      success: true,
      data: {
        asset,
        message: 'Token issued successfully',
      },
    });

    logger.info('Token issued via API', { assetCode });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tokens/mint
 * Mint tokens to a distributor
 */
router.post('/mint', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = mintTokenSchema.validate(req.body);

    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { issuerSecret, distributorPublicKey, assetCode, amount } = value;

    const result = await tokenMintingService.mintTokens(
      issuerSecret,
      distributorPublicKey,
      assetCode,
      amount
    );

    res.json({
      success: true,
      data: result,
    });

    logger.info('Tokens minted via API', { assetCode, amount });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tokens/trustline
 * Establish trustline for an asset
 */
router.post('/trustline', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = trustlineSchema.validate(req.body);

    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { accountSecret, assetCode, issuerPublicKey, limit } = value;

    const result = await tokenMintingService.establishTrustline(
      accountSecret,
      assetCode,
      issuerPublicKey,
      limit
    );

    res.json({
      success: true,
      data: result,
    });

    logger.info('Trustline established via API', { assetCode });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tokens/lock
 * Lock token issuance
 */
router.post('/lock', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { issuerSecret, assetCode } = req.body;

    if (!issuerSecret || !assetCode) {
      throw new ValidationError('issuerSecret and assetCode are required');
    }

    const result = await tokenMintingService.lockIssuance(issuerSecret, assetCode);

    res.json({
      success: true,
      data: result,
      message: 'Token issuance locked permanently',
    });

    logger.info('Token issuance locked via API', { assetCode });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tokens/burn
 * Burn tokens
 */
router.post('/burn', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { holderSecret, assetCode, issuerPublicKey, amount } = req.body;

    if (!holderSecret || !assetCode || !issuerPublicKey || !amount) {
      throw new ValidationError('All fields are required');
    }

    const result = await tokenMintingService.burnTokens(
      holderSecret,
      assetCode,
      issuerPublicKey,
      amount
    );

    res.json({
      success: true,
      data: result,
    });

    logger.info('Tokens burned via API', { assetCode, amount });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tokens/:assetCode/:issuer
 * Get asset information
 */
router.get('/:assetCode/:issuer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { assetCode, issuer } = req.params;

    const assetInfo = await tokenMintingService.getAssetInfo(assetCode, issuer);

    res.json({
      success: true,
      data: assetInfo,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tokens/issued/:issuer
 * Get all assets issued by an account
 */
router.get('/issued/:issuer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { issuer } = req.params;

    const assets = await tokenMintingService.getIssuedAssets(issuer);

    res.json({
      success: true,
      data: assets,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tokens/airdrop
 * Airdrop tokens to multiple recipients
 */
router.post('/airdrop', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = airdropSchema.validate(req.body);

    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { issuerSecret, assetCode, recipients } = value;

    const result = await tokenMintingService.airdropTokens(
      issuerSecret,
      assetCode,
      recipients
    );

    res.json({
      success: true,
      data: result,
      message: `Airdrop completed: ${result.successful} successful, ${result.failed} failed`,
    });

    logger.info('Airdrop completed via API', {
      assetCode,
      successful: result.successful,
      failed: result.failed,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
