import type { Response } from "express";
import type { AuthRequest } from "../middlewares/middlewareAuth.js";
import {
  SUCCESS_CREATED_ITEM,
  SUCCESS_DELETED_ITEM,
  SUCCESS_UPDATED_ITEM,
  SUCCESS_STOCK_OUT,
  ERROR_OUT_OF_STOCK,
} from "../utils/message.js";
import {
  ERROR_NOT_FOUND,
  ERROR_INTERNAL_SERVER,
  ERROR_INVALID_ID,
  ERROR_REQUIRED_FIELDS,
  ERROR_FORBIDDEN,
} from "../utils/message.js";
import {
  CreateProductService,
  DeleteProductService,
  GetProductByIdService,
  GetProductService,
  UpdateProductService,
  StockOutService,
} from "../services/product.js";

export class CreateProductController {
  async handle(request: AuthRequest, response: Response) {
    const { name, quantidade, preco, custo, condicao, id_lote } = request.body;

    if (
      !name ||
      quantidade === undefined ||
      quantidade === null ||
      preco === undefined ||
      preco === null ||
      !condicao
    ) {
      return response.status(400).json({ ...ERROR_REQUIRED_FIELDS });
    }

    if (!request.userId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const createProductService = new CreateProductService();

      const product = await createProductService.execute({
        name,
        quantidade,
        preco,
        custo: custo !== undefined && custo !== null ? custo : undefined,
        condicao,
        id_user: request.userId,
        id_lote: id_lote ? Number(id_lote) : undefined,
      });

      return response
        .status(201)
        .json({ ...SUCCESS_CREATED_ITEM, data: product });
    } catch (error) {
      console.log("Error creating product:", error);
      return response.status(500).json({ ...ERROR_INTERNAL_SERVER });
    }
  }
}

export class UpdateProductController {
  async handle(request: AuthRequest, response: Response) {
    const id = Number(request.params.id);
    const { name, quantidade, preco, custo, condicao, id_lote } = request.body;

    if (
      isNaN(id) ||
      !id ||
      !name ||
      quantidade === undefined ||
      quantidade === null ||
      preco === undefined ||
      preco === null ||
      !condicao
    ) {
      return response.status(400).json({ ...ERROR_REQUIRED_FIELDS });
    }

    if (!request.userId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      // Validação de autorização: verifica se o produto pertence ao usuário autenticado
      const getProductByIdService = new GetProductByIdService();
      const product = await getProductByIdService.execute(id);

      if (!product || (typeof product === "object" && "status" in product)) {
        return response.status(404).json({ ...ERROR_NOT_FOUND });
      }

      // Verifica se o produto pertence ao usuário autenticado
      if (product.id_user !== request.userId) {
        return response.status(403).json({ ...ERROR_FORBIDDEN });
      }

      const updateProductService = new UpdateProductService();

      const updatedProduct = await updateProductService.execute(id, {
        name,
        quantidade,
        preco,
        custo: custo !== undefined && custo !== null ? custo : undefined,
        condicao,
        id_user: request.userId,
        id_lote:
          id_lote !== undefined
            ? id_lote
              ? Number(id_lote)
              : undefined
            : undefined,
      });

      return response
        .status(200)
        .json({ ...SUCCESS_UPDATED_ITEM, data: updatedProduct });
    } catch (error) {
      console.log("Error updating product:", error);
      return response.status(500).json({ ...ERROR_INTERNAL_SERVER });
    }
  }
}

export class DeleteProductController {
  async handle(request: AuthRequest, response: Response) {
    const id = Number(request.params.id);

    if (isNaN(id) || !id) {
      return response.status(400).json({ ...ERROR_INVALID_ID });
    }

    if (!request.userId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      // Validação de autorização: verifica se o produto pertence ao usuário autenticado
      const getProductByIdService = new GetProductByIdService();
      const product = await getProductByIdService.execute(id);

      if (!product || (typeof product === "object" && "status" in product)) {
        return response.status(404).json({ ...ERROR_NOT_FOUND });
      }

      // Verifica se o produto pertence ao usuário autenticado
      if (product.id_user !== request.userId) {
        return response.status(403).json({ ...ERROR_FORBIDDEN });
      }

      const deleteProductService = new DeleteProductService();

      const deletedProduct = await deleteProductService.execute(id);

      return response
        .status(200)
        .json({ ...SUCCESS_DELETED_ITEM, data: deletedProduct });
    } catch (error) {
      console.log("Error deleting product:", error);
      return response.status(500).json({ ...ERROR_INTERNAL_SERVER });
    }
  }
}

export class GetProductController {
  async handle(request: AuthRequest, response: Response) {
    if (!request.userId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const getProductService = new GetProductService();

      const product = await getProductService.execute(request.userId);

      return response.status(200).json(product);
    } catch (error) {
      console.log("Error listing products:", error);
      return response.status(500).json({ ...ERROR_INTERNAL_SERVER });
    }
  }
}

export class GetProductByIdController {
  async handle(request: AuthRequest, response: Response) {
    const id = Number(request.params.id);

    if (isNaN(id) || !id) {
      return response.status(400).json({ ...ERROR_INVALID_ID });
    }

    if (!request.userId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const getProductByIdService = new GetProductByIdService();

      const product = await getProductByIdService.execute(id);

      if (!product || (typeof product === "object" && "status" in product)) {
        return response.status(404).json({ ...ERROR_NOT_FOUND });
      }

      // Validação de autorização: verifica se o produto pertence ao usuário autenticado
      if (product.id_user !== request.userId) {
        return response.status(403).json({ ...ERROR_FORBIDDEN });
      }

      return response.status(200).json(product);
    } catch (error) {
      console.log("Error fetching product by ID:", error);
      return response.status(500).json({ ...ERROR_INTERNAL_SERVER });
    }
  }
}

export class StockOutController {
  async handle(request: AuthRequest, response: Response) {
    const id = Number(request.params.id);
    const qtd = Number(request.body.quantidade) || 1;

    if (isNaN(id) || !id) {
      return response.status(400).json({ ...ERROR_INVALID_ID });
    }

    if (!request.userId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      // Verifica se o produto existe e pertence ao usuário
      const getProductByIdService = new GetProductByIdService();
      const product = await getProductByIdService.execute(id);

      if (!product || (typeof product === "object" && "status" in product)) {
        return response.status(404).json({ ...ERROR_NOT_FOUND });
      }

      if (product.id_user !== request.userId) {
        return response.status(403).json({ ...ERROR_FORBIDDEN });
      }

      const stockOutService = new StockOutService();
      const result = await stockOutService.execute(id, qtd);

      if (typeof result === "object" && "status" in result && !result.status) {
        return response.status(result.status_code).json(result);
      }

      return response.status(200).json({ ...SUCCESS_STOCK_OUT, data: result });
    } catch (error) {
      console.log("Error in stock out:", error);
      return response.status(500).json({ ...ERROR_INTERNAL_SERVER });
    }
  }
}
