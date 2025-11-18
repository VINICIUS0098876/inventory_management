import prismaClient from "../prisma/index.js";
import {
  ERROR_REQUIRED_FIELDS,
  ERROR_INTERNAL_SERVER_DB,
  ERROR_NOT_FOUND,
  ERROR_INVALID_ID,
} from "../utils/message.js";

interface Product {
  id_user: number;
  name: string;
  quantidade: number;
  preco: number;
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
    id_user,
  }: Product): Promise<CreateProductResult> {
    try {
      if (!name || !quantidade || !preco || !id_user) {
        return ERROR_REQUIRED_FIELDS;
      }

      const product = await prismaClient.products.create({
        data: {
          name,
          quantidade,
          preco,
          id_user,
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
    { name, quantidade, preco, id_user }: Product
  ): Promise<UpdateProductResult> {
    try {
      if (!id_product || !name || !quantidade || !preco || !id_user) {
        return ERROR_REQUIRED_FIELDS;
      }

      const product = await prismaClient.products.update({
        where: {
          id_product,
        },
        data: {
          name,
          quantidade,
          preco,
          id_user,
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
  async execute(): Promise<GetProductResult> {
    try {
      const product = await prismaClient.products.findMany();

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
