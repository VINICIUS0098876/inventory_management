import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/middlewareAuth.js";
import {
  SUCCESS_CREATED_ITEM,
  SUCCESS_DELETED_ITEM,
  SUCCESS_LOGIN_ITEM,
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
  CreateUserService,
  DeleteUserService,
  GetUserByIdService,
  GetUserService,
  LoginUserService,
  UpdateUserService,
} from "../services/user.js";

export class CreateUserController {
  async handle(request: Request, response: Response) {
    const { name, email, passwordHash } = request.body;

    if (!name || !email || !passwordHash) {
      return response.status(400).json({ ...ERROR_REQUIRED_FIELDS });
    }

    try {
      const createUserService = new CreateUserService();

      const user = await createUserService.execute({
        name,
        email,
        passwordHash,
      });

      return response.status(201).json({ ...SUCCESS_CREATED_ITEM, data: user });
    } catch (error) {
      console.log("Error creating user:", error);
      return response.status(500).json({ ...ERROR_INTERNAL_SERVER });
    }
  }
}

export class GetUserController {
  async handle(request: AuthRequest, response: Response) {
    try {
      const getUserService = new GetUserService();

      const user = await getUserService.execute();

      return response.status(200).json(user);
    } catch (error) {
      console.log("Error listing users:", error);
      return response.status(500).json({ error: "Internal server error" });
    }
  }
}

export class UpdateUserController {
  async handle(request: AuthRequest, response: Response) {
    const id = Number(request.params.id);
    const { name, email, passwordHash } = request.body;

    if (isNaN(id) || !id || !name || !email || !passwordHash) {
      return response.status(400).json({ ...ERROR_REQUIRED_FIELDS });
    }

    // Validação de autorização: verifica se o usuário está tentando editar seus próprios dados
    if (!request.userId || request.userId !== id) {
      return response.status(403).json({ ...ERROR_FORBIDDEN });
    }

    try {
      const updateUserService = new UpdateUserService();

      const user = await updateUserService.execute(id, {
        name,
        email,
        passwordHash,
      });

      return response.status(200).json({ ...SUCCESS_UPDATED_ITEM, data: user });
    } catch (error) {
      console.log("Error updating user:", error);
      return response.status(500).json({ ...ERROR_INTERNAL_SERVER });
    }
  }
}

export class DeleteUserController {
  async handle(request: AuthRequest, response: Response) {
    const id = Number(request.params.id);

    if (isNaN(id) || !id) {
      return response.status(400).json({ ...ERROR_INVALID_ID });
    }

    // Validação de autorização: verifica se o usuário está tentando deletar sua própria conta
    if (!request.userId || request.userId !== id) {
      return response.status(403).json({ ...ERROR_FORBIDDEN });
    }

    try {
      const deleteUserService = new DeleteUserService();

      const user = await deleteUserService.execute(id);

      return response.status(200).json({ ...SUCCESS_DELETED_ITEM, data: user });
    } catch (error) {
      console.log("Error deleting user:", error);
      return response.status(500).json({ ...ERROR_INTERNAL_SERVER });
    }
  }
}

export class GetUserByIdController {
  async handle(request: AuthRequest, response: Response) {
    const id = Number(request.params.id);

    if (isNaN(id) || !id) {
      return response.status(400).json({ ...ERROR_INVALID_ID });
    }

    // Validação de autorização: verifica se o usuário está tentando buscar seus próprios dados
    if (!request.userId || request.userId !== id) {
      return response.status(403).json({ ...ERROR_FORBIDDEN });
    }

    try {
      const getUserByIdService = new GetUserByIdService();

      const user = await getUserByIdService.execute(id);

      if (!user) {
        return response.status(404).json({ ...ERROR_NOT_FOUND });
      }

      return response.status(200).json(user);
    } catch (error) {
      console.log("Error fetching user by ID:", error);
      return response.status(500).json({ ...ERROR_INTERNAL_SERVER });
    }
  }
}

export class LoginUserController {
  async handle(request: Request, response: Response) {
    const { email, passwordHash } = request.body;

    if (!email || !passwordHash) {
      return response.status(400).json({ ...ERROR_REQUIRED_FIELDS });
    }

    try {
      const loginUserService = new LoginUserService();
      const login = await loginUserService.execute(email, passwordHash);

      return response.status(200).json({ ...SUCCESS_LOGIN_ITEM, Login: login });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao fazer login";
      return response.status(401).json({ message });
    }
  }
}
