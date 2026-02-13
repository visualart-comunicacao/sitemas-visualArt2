import { prisma } from '../../db/prisma.js';
import { calculateItemPrice } from '../orders/price-calculator.js';
import { nextOrderCode } from '../../services/order-code.service.js';

function badRequest(msg) {
  const err = new Error(msg);
  err.status = 400;
  err.name = 'BadRequest';
  return err;
}
function notFound(msg) {
  const err = new Error(msg);
  err.status = 404;
  err.name = 'NotFound';
  return err;
}

export const QuotesService = {
  async createQuote(payload) {
    return prisma.$transaction(async (tx) => {
      const customer = await tx.user.findUnique({ where: { id: payload.customerUserId } });
      if (!customer) throw notFound('Customer not found');

      const productIds = [...new Set(payload.items.map((i) => i.productId))];
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        include: { optionGroups: { include: { options: true } } },
      });
      const byId = new Map(products.map((p) => [p.id, p]));

      let subtotalCents = 0;
      const orderItemsCreate = [];

      for (const item of payload.items) {
        const product = byId.get(item.productId);
        if (!product) throw notFound(`Product not found: ${item.productId}`);
        if (!product.active) throw badRequest(`Product inactive: ${product.name}`);

        const allOptions = product.optionGroups.flatMap((g) => g.options);
        const optionById = new Map(allOptions.map((o) => [o.id, o]));
        const selectedOptions = (item.optionIds ?? []).map((id) => optionById.get(id)).filter(Boolean);

        // valida required/min/max
        for (const group of product.optionGroups) {
          const selectedInGroup = selectedOptions.filter((o) => o.groupId === group.id);
          const minRequired = group.required ? Math.max(1, group.minSelect) : group.minSelect;

          if (selectedInGroup.length < minRequired) {
            throw badRequest(`Missing option(s) for group: ${group.name}`);
          }
          if (selectedInGroup.length > group.maxSelect) {
            throw badRequest(`maxSelect exceeded for group: ${group.name}`);
          }
        }

        const price = calculateItemPrice({
          product,
          selectedOptions,
          width: item.width ?? null,
          height: item.height ?? null,
          quantity: item.quantity,
        });

        subtotalCents += price.lineTotalCents;

        orderItemsCreate.push({
          productId: product.id,
          name: product.name,
          priceCents: price.unitPriceCents,
          quantity: item.quantity,
          width: item.width ?? null,
          height: item.height ?? null,
          optionIds: item.optionIds ?? [],
        });
      }

      const code = await nextOrderCode(tx, 'ORC');

      const discountCents = payload.discountCents ?? 0;
      const shippingCents = payload.shippingCents ?? 0;
      const taxCents = payload.taxCents ?? 0;
      const totalCents = Math.max(0, subtotalCents - discountCents + shippingCents + taxCents);

      const order = await tx.order.create({
        data: {
          userId: payload.customerUserId,
          code,
          type: 'QUOTE',
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          notes: payload.notes,
          internalNotes: payload.internalNotes,
          subtotalCents,
          discountCents,
          shippingCents,
          taxCents,
          totalCents,
          items: { create: orderItemsCreate },
        },
        include: { items: true },
      });

      return order;
    });
  },

  async listQuotes({ skip, take }) {
    const [total, data] = await prisma.$transaction([
      prisma.order.count({ where: { type: 'QUOTE' } }),
      prisma.order.findMany({
        where: { type: 'QUOTE' },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { items: true, user: { select: { id: true, name: true, email: true } } },
      }),
    ]);

    return { total, data };
  },
};
