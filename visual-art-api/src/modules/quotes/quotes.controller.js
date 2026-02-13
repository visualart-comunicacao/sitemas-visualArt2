import { QuotesService } from './quotes.service.js';
import { getPagination, buildMeta } from '../../utils/pagination.js';

export const QuotesController = {
  async create(req, res, next) {
    try {
      const created = await QuotesService.createQuote(req.validated.body);
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  },

  async list(req, res, next) {
    try {
      const { page, pageSize, skip, take } = getPagination(req.query);
      const { total, data } = await QuotesService.listQuotes({ skip, take });
      res.json({ data, meta: buildMeta({ page, pageSize, total }) });
    } catch (e) {
      next(e);
    }
  },

  async convert(req, res, next) {
    try {
      const quoteId = req.validated.params.id;
      const sale = await QuotesService.convertToSale(quoteId, req.validated.body ?? {});
      res.status(201).json(sale);
    } catch (e) {
      next(e);
    }
  },
};
