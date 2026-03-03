import type { Response } from "express";
import type { AuthRequest } from "../middlewares/middlewareAuth.js";
import {
  SUCCESS_CREATED_ITEM,
  SUCCESS_DELETED_ITEM,
  SUCCESS_UPDATED_ITEM,
  ERROR_NOT_FOUND,
  ERROR_INTERNAL_SERVER,
  ERROR_INVALID_ID,
  ERROR_REQUIRED_FIELDS,
  ERROR_FORBIDDEN,
} from "../utils/message.js";
import {
  CreateKitService,
  UpdateKitService,
  DeleteKitService,
  GetKitsService,
  GetKitByIdService,
} from "../services/kit.js";

export class CreateKitController {
  async handle(request: AuthRequest, response: Response) {
    const { nome, sku, precoVenda, items } = request.body;

    if (
      !nome ||
      !sku ||
      precoVenda === undefined ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return response.status(400).json({ ...ERROR_REQUIRED_FIELDS });
    }

    if (!request.userId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const createKitService = new CreateKitService();

      const kit = await createKitService.execute({
        nome,
        sku,
        precoVenda: Number(precoVenda),
        id_user: Number(request.userId),
        items: items.map((item: any) => ({
          id_product: Number(item.id_product),
          quantidade: Number(item.quantidade),
        })),
      });

      if ("status_code" in kit) {
        return response.status(kit.status_code).json(kit);
      }

      return response.status(201).json({
        ...SUCCESS_CREATED_ITEM,
        data: kit,
      });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ ...ERROR_INTERNAL_SERVER });
    }
  }
}

export class UpdateKitController {
  async handle(request: AuthRequest, response: Response) {
    const { id } = request.params;
    const { nome, sku, precoVenda, items } = request.body;

    if (!id || isNaN(Number(id))) {
      return response.status(400).json({ ...ERROR_INVALID_ID });
    }

    if (
      !nome ||
      !sku ||
      precoVenda === undefined ||
      !items ||
      !Array.isArray(items)
    ) {
      return response.status(400).json({ ...ERROR_REQUIRED_FIELDS });
    }

    if (!request.userId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const getKitByIdService = new GetKitByIdService();
      const existingKit = await getKitByIdService.execute(Number(id));

      if ("status_code" in existingKit!) {
        return response.status(existingKit!.status_code).json(existingKit);
      }

      if (
        existingKit &&
        "id_user" in existingKit &&
        existingKit.id_user !== Number(request.userId)
      ) {
        return response.status(403).json({ ...ERROR_FORBIDDEN });
      }

      const updateKitService = new UpdateKitService();

      const kit = await updateKitService.execute(Number(id), {
        nome,
        sku,
        precoVenda: Number(precoVenda),
        id_user: Number(request.userId),
        items: items.map((item: any) => ({
          id_product: Number(item.id_product),
          quantidade: Number(item.quantidade),
        })),
      });

      if ("status_code" in kit) {
        return response.status(kit.status_code).json(kit);
      }

      return response.status(200).json({
        ...SUCCESS_UPDATED_ITEM,
        data: kit,
      });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ ...ERROR_INTERNAL_SERVER });
    }
  }
}

export class DeleteKitController {
  async handle(request: AuthRequest, response: Response) {
    const { id } = request.params;

    if (!id || isNaN(Number(id))) {
      return response.status(400).json({ ...ERROR_INVALID_ID });
    }

    if (!request.userId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const getKitByIdService = new GetKitByIdService();
      const existingKit = await getKitByIdService.execute(Number(id));

      if ("status_code" in existingKit!) {
        return response.status(existingKit!.status_code).json(existingKit);
      }

      if (
        existingKit &&
        "id_user" in existingKit &&
        existingKit.id_user !== Number(request.userId)
      ) {
        return response.status(403).json({ ...ERROR_FORBIDDEN });
      }

      const deleteKitService = new DeleteKitService();
      const kit = await deleteKitService.execute(Number(id));

      if ("status_code" in kit) {
        return response.status(kit.status_code).json(kit);
      }

      return response.status(200).json({
        ...SUCCESS_DELETED_ITEM,
        data: kit,
      });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ ...ERROR_INTERNAL_SERVER });
    }
  }
}

export class GetKitsController {
  async handle(request: AuthRequest, response: Response) {
    if (!request.userId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const getKitsService = new GetKitsService();
      const kits = await getKitsService.execute(Number(request.userId));

      if ("status_code" in kits) {
        return response.status(kits.status_code).json(kits);
      }

      return response.status(200).json(kits);
    } catch (error) {
      console.log(error);
      return response.status(500).json({ ...ERROR_INTERNAL_SERVER });
    }
  }
}

export class GetKitByIdController {
  async handle(request: AuthRequest, response: Response) {
    const { id } = request.params;

    if (!id || isNaN(Number(id))) {
      return response.status(400).json({ ...ERROR_INVALID_ID });
    }

    if (!request.userId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const getKitByIdService = new GetKitByIdService();
      const kit = await getKitByIdService.execute(Number(id));

      if (!kit) {
        return response.status(404).json({ ...ERROR_NOT_FOUND });
      }

      if ("status_code" in kit) {
        return response.status(kit.status_code).json(kit);
      }

      if (kit.id_user !== Number(request.userId)) {
        return response.status(403).json({ ...ERROR_FORBIDDEN });
      }

      return response.status(200).json(kit);
    } catch (error) {
      console.log(error);
      return response.status(500).json({ ...ERROR_INTERNAL_SERVER });
    }
  }
}
