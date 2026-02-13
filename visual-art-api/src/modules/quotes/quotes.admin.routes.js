import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { QuotesController } from './quotes.controller.js';
import { QuoteCreateSchema, QuotesListQuerySchema } from './quotes.schemas.js';

export const router = Router();

router.post('/quotes', validate(QuoteCreateSchema), QuotesController.create);
router.get('/quotes', validate(QuotesListQuerySchema), QuotesController.list);
