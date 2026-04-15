import { z } from "zod";
import AppError from "../errors/AppError.js";

// ─── Helper: middleware de validação ─────────────────────────────────────────
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(" | ");
      return next(new AppError(message, 400, "VALIDATION_ERROR"));
    }
    req.body = result.data;
    next();
  };
}

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        marketplacePartId: z.string().min(1, "ID da peça obrigatório"),
        name: z.string().optional(),
        quantity: z.number().int().positive("Quantidade deve ser positiva"),
        price: z.number().positive("Preço deve ser positivo"),
        oemNumber: z.string().optional(),
        sellerId: z.string().optional(),
      })
    )
    .min(1, "Carrinho não pode ser vazio"),
  total: z.number().positive("Total deve ser positivo"),
  shippingAddress: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
    })
    .optional(),
});

export const createMarketplacePartSchema = z.object({
  oemNumber: z.string().min(1, "OEM obrigatório"),
  name: z.string().min(2, "Nome obrigatório"),
  brandId: z.string().min(1, "Marca obrigatória"),
  categoryId: z.string().min(1, "Categoria obrigatória"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Preço deve ser positivo"),
  stock: z.coerce.number().int().nonnegative("Estoque não pode ser negativo"),
  condition: z.enum(["new", "used", "refurbished"], {
    errorMap: () => ({ message: "Condição: new, used ou refurbished" }),
  }),
  warrantyMonths: z.coerce.number().int().nonnegative().optional().default(0),
});

export const createReviewSchema = z.object({
  sellerId: z.string().min(1, "Vendedor obrigatório"),
  orderId: z.string().min(1, "Pedido obrigatório"),
  rating: z.number().int().min(1).max(5, "Rating entre 1 e 5"),
  comment: z.string().max(500).optional().default(""),
});

export const searchPartsSchema = z.object({
  plate: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  engineDisplacement: z.string().optional(),
  fuelType: z.string().optional(),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
  lastDocId: z.string().optional(),
  orderBy: z.string().optional().default("createdAt"),
  orderDirection: z.enum(["asc", "desc"]).optional().default("desc"),
  minStock: z.coerce.number().optional(),
  condition: z.string().optional(),
  minWarranty: z.coerce.number().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(
    ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    { errorMap: () => ({ message: "Status inválido" }) }
  ),
});

export const plateSearchSchema = z.object({
  plate: z.string().min(7, "Placa inválida").max(8, "Placa inválida"),
});

export const adminRejectSchema = z.object({
  reason: z.string().min(5, "Motivo deve ter ao menos 5 caracteres").optional(),
});
