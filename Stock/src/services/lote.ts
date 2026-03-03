import prismaClient from "../prisma/index.js";
import {
  ERROR_REQUIRED_FIELDS,
  ERROR_INTERNAL_SERVER_DB,
  ERROR_NOT_FOUND,
  ERROR_INVALID_ID,
} from "../utils/message.js";

interface Lote {
  id_user: number;
  nome: string;
  custoTotal: number;
  descricao?: string;
}

type CreateLoteResult =
  | Awaited<ReturnType<typeof prismaClient.lotes.create>>
  | typeof ERROR_REQUIRED_FIELDS
  | typeof ERROR_INTERNAL_SERVER_DB;

export class CreateLoteService {
  async execute({
    nome,
    custoTotal,
    descricao,
    id_user,
  }: Lote): Promise<CreateLoteResult> {
    try {
      if (
        !nome ||
        custoTotal === undefined ||
        custoTotal === null ||
        !id_user
      ) {
        return ERROR_REQUIRED_FIELDS;
      }

      const lote = await prismaClient.lotes.create({
        data: {
          nome,
          custoTotal,
          descricao: descricao ?? null,
          id_user,
        },
      });

      return lote;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}

type UpdateLoteResult =
  | Awaited<ReturnType<typeof prismaClient.lotes.update>>
  | typeof ERROR_REQUIRED_FIELDS
  | typeof ERROR_INTERNAL_SERVER_DB;

export class UpdateLoteService {
  async execute(
    id_lote: number,
    { nome, custoTotal, descricao, id_user }: Lote,
  ): Promise<UpdateLoteResult> {
    try {
      if (
        !id_lote ||
        !nome ||
        custoTotal === undefined ||
        custoTotal === null ||
        !id_user
      ) {
        return ERROR_REQUIRED_FIELDS;
      }

      const lote = await prismaClient.lotes.update({
        where: { id_lote },
        data: {
          nome,
          custoTotal,
          descricao: descricao ?? null,
        },
      });

      return lote;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}

type DeleteLoteResult =
  | Awaited<ReturnType<typeof prismaClient.lotes.delete>>
  | typeof ERROR_INVALID_ID
  | typeof ERROR_INTERNAL_SERVER_DB;

export class DeleteLoteService {
  async execute(id_lote: number): Promise<DeleteLoteResult> {
    if (isNaN(id_lote) || !id_lote) {
      return ERROR_INVALID_ID;
    }

    try {
      // Desvincula produtos do lote antes de deletar
      await prismaClient.products.updateMany({
        where: { id_lote },
        data: { id_lote: null },
      });

      const lote = await prismaClient.lotes.delete({
        where: { id_lote },
      });

      return lote;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}

type GetLotesResult =
  | Awaited<ReturnType<typeof prismaClient.lotes.findMany>>
  | typeof ERROR_NOT_FOUND
  | typeof ERROR_INTERNAL_SERVER_DB;

export class GetLotesService {
  async execute(id_user: number): Promise<GetLotesResult> {
    try {
      const lotes = await prismaClient.lotes.findMany({
        where: { id_user },
        include: {
          products: {
            select: {
              id_product: true,
              name: true,
              sku: true,
              quantidade: true,
              preco: true,
              condicao: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return lotes;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}

type GetLoteByIdResult =
  | Awaited<ReturnType<typeof prismaClient.lotes.findUnique>>
  | typeof ERROR_INVALID_ID
  | typeof ERROR_NOT_FOUND
  | typeof ERROR_INTERNAL_SERVER_DB;

export class GetLoteByIdService {
  async execute(id_lote: number): Promise<GetLoteByIdResult> {
    if (isNaN(id_lote) || !id_lote) {
      return ERROR_INVALID_ID;
    }
    try {
      const lote = await prismaClient.lotes.findUnique({
        where: { id_lote },
        include: {
          products: {
            select: {
              id_product: true,
              name: true,
              sku: true,
              quantidade: true,
              preco: true,
              custo: true,
              condicao: true,
            },
          },
        },
      });

      if (!lote) {
        return ERROR_NOT_FOUND;
      }

      return lote;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}
