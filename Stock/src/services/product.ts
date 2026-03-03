import prismaClient from "../prisma/index.js";
import {
  ERROR_REQUIRED_FIELDS,
  ERROR_INTERNAL_SERVER_DB,
  ERROR_NOT_FOUND,
  ERROR_INVALID_ID,
  ERROR_OUT_OF_STOCK,
} from "../utils/message.js";

// Condições válidas para um item
const CONDICOES_VALIDAS = ["NOVO", "REEMBALADO", "USADO", "DEFEITO"] as const;
type CondicaoItem = (typeof CONDICOES_VALIDAS)[number];

interface Product {
  id_user: number;
  name: string;
  quantidade: number;
  preco: number;
  custo?: number;
  condicao: CondicaoItem;
  id_lote?: number;
}

// Mapa de abreviações de condição para o SKU
const CONDICAO_SKU_MAP: Record<CondicaoItem, string> = {
  NOVO: "NV",
  REEMBALADO: "RE",
  USADO: "US",
  DEFEITO: "DF",
};

/**
 * Gera um código SKU automático no formato: PREFIX-COND-SEQ
 * Exemplo: PAL01-VENT-001
 * - Prefix: primeiras 5 letras do nome (uppercase, sem espaços/acentos)
 * - Cond: abreviação da condição (NV, RE, US, DF)
 * - Seq: sequencial de 3 dígitos baseado nos produtos do usuário
 */
async function generateSKU(
  name: string,
  condicao: CondicaoItem,
  id_user: number,
): Promise<string> {
  // Normaliza o nome: remove acentos, espaços, caracteres especiais
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  // Pega até 5 caracteres do nome
  const prefix = normalized.substring(0, 5).padEnd(3, "X");

  // Abreviação da condição
  const condCode = CONDICAO_SKU_MAP[condicao] || "NV";

  // Conta quantos SKUs semelhantes esse usuário já tem para gerar sequencial
  const existingCount = await prismaClient.products.count({
    where: {
      id_user,
      sku: {
        startsWith: `${prefix}-${condCode}-`,
      },
    },
  });

  const seq = String(existingCount + 1).padStart(3, "0");

  return `${prefix}-${condCode}-${seq}`;
}

type CreateProductResult =
  | Awaited<ReturnType<typeof prismaClient.products.create>>
  | typeof ERROR_REQUIRED_FIELDS
  | typeof ERROR_INTERNAL_SERVER_DB;

export class CreateProductService {
  async execute({
    name,
    quantidade,
    preco,
    custo,
    id_user,
    condicao,
    id_lote,
  }: Product): Promise<CreateProductResult> {
    try {
      if (
        !name ||
        quantidade === undefined ||
        quantidade === null ||
        preco === undefined ||
        preco === null ||
        !id_user ||
        !condicao ||
        !CONDICOES_VALIDAS.includes(condicao)
      ) {
        return ERROR_REQUIRED_FIELDS;
      }

      // Gera o SKU automático
      const sku = await generateSKU(name, condicao, id_user);

      const product = await prismaClient.products.create({
        data: {
          name,
          sku,
          condicao,
          quantidade,
          preco,
          custo: custo ?? null,
          id_user,
          id_lote: id_lote ?? null,
        },
      });

      return product;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}

type UpdateProductResult =
  | Awaited<ReturnType<typeof prismaClient.products.update>>
  | typeof ERROR_REQUIRED_FIELDS
  | typeof ERROR_INTERNAL_SERVER_DB;

export class UpdateProductService {
  async execute(
    id_product: number,
    { name, quantidade, preco, custo, id_user, condicao, id_lote }: Product,
  ): Promise<UpdateProductResult> {
    try {
      if (
        !id_product ||
        !name ||
        quantidade === undefined ||
        quantidade === null ||
        preco === undefined ||
        preco === null ||
        !id_user ||
        !condicao ||
        !CONDICOES_VALIDAS.includes(condicao)
      ) {
        return ERROR_REQUIRED_FIELDS;
      }

      // Regenera o SKU com os novos dados
      const sku = await generateSKU(name, condicao, id_user);

      const product = await prismaClient.products.update({
        where: {
          id_product,
        },
        data: {
          name,
          sku,
          condicao,
          quantidade,
          preco,
          custo: custo ?? null,
          id_user,
          id_lote: id_lote ?? null,
        },
      });

      return product;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}

type DeleteProductResult =
  | Awaited<ReturnType<typeof prismaClient.products.delete>>
  | typeof ERROR_INVALID_ID
  | typeof ERROR_INTERNAL_SERVER_DB;

export class DeleteProductService {
  async execute(id_product: number): Promise<DeleteProductResult> {
    if (isNaN(id_product) || !id_product) {
      return ERROR_INVALID_ID;
    }

    try {
      const product = await prismaClient.products.delete({
        where: {
          id_product,
        },
      });

      return product;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}

type GetProductResult =
  | Awaited<ReturnType<typeof prismaClient.products.findMany>>
  | typeof ERROR_NOT_FOUND
  | typeof ERROR_INTERNAL_SERVER_DB;

export class GetProductService {
  async execute(id_user: number): Promise<GetProductResult> {
    try {
      const product = await prismaClient.products.findMany({
        where: {
          id_user,
        },
      });

      if (product.length === 0) {
        return ERROR_NOT_FOUND;
      }

      return product;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}

type GetProductByIdResult =
  | Awaited<ReturnType<typeof prismaClient.products.findUnique>>
  | typeof ERROR_INVALID_ID
  | typeof ERROR_NOT_FOUND
  | typeof ERROR_INTERNAL_SERVER_DB;

export class GetProductByIdService {
  async execute(id_product: number): Promise<GetProductByIdResult> {
    if (isNaN(id_product) || !id_product) {
      return ERROR_INVALID_ID;
    }
    try {
      const product = await prismaClient.products.findUnique({
        where: {
          id_product: id_product,
        },
      });

      if (!product) {
        return ERROR_NOT_FOUND;
      }

      return product;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}

type StockOutResult =
  | Awaited<ReturnType<typeof prismaClient.products.update>>
  | typeof ERROR_INVALID_ID
  | typeof ERROR_NOT_FOUND
  | typeof ERROR_OUT_OF_STOCK
  | typeof ERROR_INTERNAL_SERVER_DB;

export class StockOutService {
  async execute(id_product: number, qtd: number = 1): Promise<StockOutResult> {
    if (isNaN(id_product) || !id_product) {
      return ERROR_INVALID_ID;
    }
    if (qtd < 1) {
      return ERROR_INVALID_ID;
    }

    try {
      const product = await prismaClient.products.findUnique({
        where: { id_product },
      });

      if (!product) {
        return ERROR_NOT_FOUND;
      }

      if (product.quantidade < qtd) {
        return ERROR_OUT_OF_STOCK;
      }

      const updated = await prismaClient.products.update({
        where: { id_product },
        data: { quantidade: product.quantidade - qtd },
      });

      return updated;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}
