import { z } from 'zod';

export const QuoteCreateSchema = z.object({
  body: z.object({
    customerUserId: z.string().min(1), // cliente alvo (User.id)
    notes: z.string().optional(),
    internalNotes: z.string().optional(),
    discountCents: z.number().int().min(0).optional().default(0),
    shippingCents: z.number().int().min(0).optional().default(0),
    taxCents: z.number().int().min(0).optional().default(0),
    items: z.array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(999),
        width: z.number().int().positive().optional().nullable(),
        height: z.number().int().positive().optional().nullable(),
        optionIds: z.array(z.string().min(1)).optional().default([]),
      }),
    ).min(1),
  }),
});

export const QuotesListQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    pageSize: z.string().optional(),
  }),
});

export const QuoteConvertSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z
    .object({
      // opcional: forçar status inicial da venda
      saleStatus: z.enum(['PENDING', 'PAID', 'CANCELED', 'SHIPPED', 'DELIVERED']).optional(),
      // opcional: copiar observação extra
      notes: z.string().optional().nullable(),
    })
    .optional(),
});
