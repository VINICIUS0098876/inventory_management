import prismaClient from "../prisma/index.js";
import {
  ERROR_REQUIRED_FIELDS,
  ERROR_INTERNAL_SERVER_DB,
  ERROR_NOT_FOUND,
  ERROR_INVALID_ID,
} from "../utils/message.js";

interface KitItem {
  id_product: number;
  quantidade: number;
}

interface Kit {
  id_user: number;
  nome: string;
  sku: string;
  precoVenda: number;
  items: KitItem[];
}

// ===================== CREATE =====================

type CreateKitResult =
  | Awaited<ReturnType<typeof prismaClient.kits.create>>
  | typeof ERROR_REQUIRED_FIELDS
  | typeof ERROR_INTERNAL_SERVER_DB;

export class CreateKitService {
  async execute({
    nome,
    sku,
    precoVenda,
    id_user,
    items,
  }: Kit): Promise<CreateKitResult> {
    try {
      if (
        !nome ||
        !sku ||
        precoVenda === undefined ||
        precoVenda === null ||
        !id_user ||
        !items ||
        items.length === 0
      ) {
        return ERROR_REQUIRED_FIELDS;
      }

      const kit = await prismaClient.kits.create({
        data: {
          nome,
          sku,
          precoVenda,
          id_user,
          kit_items: {
            create: items.map((item) => ({
              id_product: item.id_product,
              quantidade: item.quantidade,
            })),
          },
        },
        include: {
          kit_items: {
            include: {
              product: {
                select: {
                  id_product: true,
                  name: true,
                  sku: true,
                  custo: true,
                  preco: true,
                  quantidade: true,
                  condicao: true,
                },
              },
            },
          },
        },
      });

      return kit;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}

// ===================== UPDATE =====================

type UpdateKitResult =
  | Awaited<ReturnType<typeof prismaClient.kits.update>>
  | typeof ERROR_REQUIRED_FIELDS
  | typeof ERROR_INTERNAL_SERVER_DB;

export class UpdateKitService {
  async execute(
    id_kit: number,
    { nome, sku, precoVenda, id_user, items }: Kit,
  ): Promise<UpdateKitResult> {
    try {
      if (
        !id_kit ||
        !nome ||
        !sku ||
        precoVenda === undefined ||
        precoVenda === null ||
        !id_user
      ) {
        return ERROR_REQUIRED_FIELDS;
      }

      // Delete existing items and recreate
      await prismaClient.kit_items.deleteMany({
        where: { id_kit },
      });

      const kit = await prismaClient.kits.update({
        where: { id_kit },
        data: {
          nome,
          sku,
          precoVenda,
          kit_items: {
            create: items.map((item) => ({
              id_product: item.id_product,
              quantidade: item.quantidade,
            })),
          },
        },
        include: {
          kit_items: {
            include: {
              product: {
                select: {
                  id_product: true,
                  name: true,
                  sku: true,
                  custo: true,
                  preco: true,
                  quantidade: true,
                  condicao: true,
                },
              },
            },
          },
        },
      });

      return kit;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}

// ===================== DELETE =====================

type DeleteKitResult =
  | Awaited<ReturnType<typeof prismaClient.kits.delete>>
  | typeof ERROR_INVALID_ID
  | typeof ERROR_INTERNAL_SERVER_DB;

export class DeleteKitService {
  async execute(id_kit: number): Promise<DeleteKitResult> {
    if (isNaN(id_kit) || !id_kit) {
      return ERROR_INVALID_ID;
    }

    try {
      // kit_items are deleted automatically via onDelete: Cascade
      const kit = await prismaClient.kits.delete({
        where: { id_kit },
      });

      return kit;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}

// ===================== GET ALL =====================

type GetKitsResult =
  | Awaited<ReturnType<typeof prismaClient.kits.findMany>>
  | typeof ERROR_NOT_FOUND
  | typeof ERROR_INTERNAL_SERVER_DB;

export class GetKitsService {
  async execute(id_user: number): Promise<GetKitsResult> {
    try {
      const kits = await prismaClient.kits.findMany({
        where: { id_user },
        include: {
          kit_items: {
            include: {
              product: {
                select: {
                  id_product: true,
                  name: true,
                  sku: true,
                  custo: true,
                  preco: true,
                  quantidade: true,
                  condicao: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return kits;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}

// ===================== GET BY ID =====================

type GetKitByIdResult =
  | Awaited<ReturnType<typeof prismaClient.kits.findUnique>>
  | typeof ERROR_INVALID_ID
  | typeof ERROR_NOT_FOUND
  | typeof ERROR_INTERNAL_SERVER_DB;

export class GetKitByIdService {
  async execute(id_kit: number): Promise<GetKitByIdResult> {
    if (isNaN(id_kit) || !id_kit) {
      return ERROR_INVALID_ID;
    }
    try {
      const kit = await prismaClient.kits.findUnique({
        where: { id_kit },
        include: {
          kit_items: {
            include: {
              product: {
                select: {
                  id_product: true,
                  name: true,
                  sku: true,
                  custo: true,
                  preco: true,
                  quantidade: true,
                  condicao: true,
                },
              },
            },
          },
        },
      });

      if (!kit) {
        return ERROR_NOT_FOUND;
      }

      return kit;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}
