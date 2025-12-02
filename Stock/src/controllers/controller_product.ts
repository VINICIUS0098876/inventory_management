import type { Response } from "express";
import type { AuthRequest } from "../middlewares/middlewareAuth.js";
import {
  SUCCESS_CREATED_ITEM,
  SUCCESS_DELETED_ITEM,
  SUCCESS_UPDATED_ITEM,
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
} from "../services/product.js";

export class CreateProductController {
  async handle(request: AuthRequest, response: Response) {
    const { name, quantidade, preco } = request.body;

    if (
      !name ||
      quantidade === undefined ||
      quantidade === null ||
      preco === undefined ||
      preco === null
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
        id_user: request.userId,
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
    const { name, quantidade, preco } = request.body;

    if (
      isNaN(id) ||
      !id ||
      !name ||
      quantidade === undefined ||
      quantidade === null ||
      preco === undefined ||
      preco === null
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
        id_user: request.userId,
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
