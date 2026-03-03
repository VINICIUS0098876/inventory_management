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
  CreateLoteService,
  UpdateLoteService,
  DeleteLoteService,
  GetLotesService,
  GetLoteByIdService,
} from "../services/lote.js";

export class CreateLoteController {
  async handle(request: AuthRequest, response: Response) {
    const { nome, custoTotal, descricao } = request.body;

    if (!nome || custoTotal === undefined || custoTotal === null) {
      return response.status(400).json({ ...ERROR_REQUIRED_FIELDS });
    }

    if (!request.userId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const createLoteService = new CreateLoteService();

      const lote = await createLoteService.execute({
        nome,
        custoTotal: Number(custoTotal),
        descricao: descricao || undefined,
        id_user: Number(request.userId),
      });

      if ("status_code" in lote) {
        return response.status(lote.status_code).json(lote);
      }

      return response.status(201).json({
        ...SUCCESS_CREATED_ITEM,
        data: lote,
      });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ ...ERROR_INTERNAL_SERVER });
    }
  }
}

export class UpdateLoteController {
  async handle(request: AuthRequest, response: Response) {
    const { id } = request.params;
    const { nome, custoTotal, descricao } = request.body;

    if (!id || isNaN(Number(id))) {
      return response.status(400).json({ ...ERROR_INVALID_ID });
    }

    if (!nome || custoTotal === undefined || custoTotal === null) {
      return response.status(400).json({ ...ERROR_REQUIRED_FIELDS });
    }

    if (!request.userId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const getLoteByIdService = new GetLoteByIdService();
      const existingLote = await getLoteByIdService.execute(Number(id));

      if ("status_code" in existingLote!) {
        return response.status(existingLote!.status_code).json(existingLote);
      }

      if (
        existingLote &&
        "id_user" in existingLote &&
        existingLote.id_user !== Number(request.userId)
      ) {
        return response.status(403).json({ ...ERROR_FORBIDDEN });
      }

      const updateLoteService = new UpdateLoteService();

      const lote = await updateLoteService.execute(Number(id), {
        nome,
        custoTotal: Number(custoTotal),
        descricao: descricao || undefined,
        id_user: Number(request.userId),
      });

      if ("status_code" in lote) {
        return response.status(lote.status_code).json(lote);
      }

      return response.status(200).json({
        ...SUCCESS_UPDATED_ITEM,
        data: lote,
      });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ ...ERROR_INTERNAL_SERVER });
    }
  }
}

export class DeleteLoteController {
  async handle(request: AuthRequest, response: Response) {
    const { id } = request.params;

    if (!id || isNaN(Number(id))) {
      return response.status(400).json({ ...ERROR_INVALID_ID });
    }

    if (!request.userId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const getLoteByIdService = new GetLoteByIdService();
      const existingLote = await getLoteByIdService.execute(Number(id));

      if ("status_code" in existingLote!) {
        return response.status(existingLote!.status_code).json(existingLote);
      }

      if (
        existingLote &&
        "id_user" in existingLote &&
        existingLote.id_user !== Number(request.userId)
      ) {
        return response.status(403).json({ ...ERROR_FORBIDDEN });
      }

      const deleteLoteService = new DeleteLoteService();
      const lote = await deleteLoteService.execute(Number(id));

      if ("status_code" in lote) {
        return response.status(lote.status_code).json(lote);
      }

      return response.status(200).json({
        ...SUCCESS_DELETED_ITEM,
        data: lote,
      });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ ...ERROR_INTERNAL_SERVER });
    }
  }
}

export class GetLotesController {
  async handle(request: AuthRequest, response: Response) {
    if (!request.userId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const getLotesService = new GetLotesService();
      const lotes = await getLotesService.execute(Number(request.userId));

      if ("status_code" in lotes) {
        return response.status(lotes.status_code).json(lotes);
      }

      return response.status(200).json(lotes);
    } catch (error) {
      console.log(error);
      return response.status(500).json({ ...ERROR_INTERNAL_SERVER });
    }
  }
}

export class GetLoteByIdController {
  async handle(request: AuthRequest, response: Response) {
    const { id } = request.params;

    if (!id || isNaN(Number(id))) {
      return response.status(400).json({ ...ERROR_INVALID_ID });
    }

    if (!request.userId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const getLoteByIdService = new GetLoteByIdService();
      const lote = await getLoteByIdService.execute(Number(id));

      if (!lote) {
        return response.status(404).json({ ...ERROR_NOT_FOUND });
      }

      if ("status_code" in lote) {
        return response.status(lote.status_code).json(lote);
      }

      if (lote.id_user !== Number(request.userId)) {
        return response.status(403).json({ ...ERROR_FORBIDDEN });
      }

      return response.status(200).json(lote);
    } catch (error) {
      console.log(error);
      return response.status(500).json({ ...ERROR_INTERNAL_SERVER });
    }
  }
}
