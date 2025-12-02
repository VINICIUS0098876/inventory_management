import prismaClient from "../prisma/index.js";
import * as bcrypt from "bcrypt";
import { TokenJWT } from "../middlewares/middlewareJWT.js";
import {
  ERROR_REQUIRED_FIELDS,
  ERROR_INTERNAL_SERVER_DB,
  ERROR_NOT_FOUND,
  ERROR_INVALID_ID,
  ERROR_INVALID_CREDENTIALS,
} from "../utils/message.js";

interface User {
  //   id_user: number;
  name: string;
  email: string;
  passwordHash: string;
}

type CreateUserResult =
  | Awaited<ReturnType<typeof prismaClient.users.create>>
  | typeof ERROR_REQUIRED_FIELDS
  | typeof ERROR_INTERNAL_SERVER_DB;

export class CreateUserService {
  async execute({
    name,
    email,
    passwordHash,
  }: User): Promise<CreateUserResult> {
    try {
      if (!name || !email || !passwordHash) {
        return ERROR_REQUIRED_FIELDS;
      }
      const password = await bcrypt.hash(passwordHash, 10);
      const user = await prismaClient.users.create({
        data: {
          name,
          email,
          passwordHash: password,
        },
      });

      return user;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}

type GetUserResult =
  | Awaited<ReturnType<typeof prismaClient.users.findMany>>
  | typeof ERROR_NOT_FOUND
  | typeof ERROR_INTERNAL_SERVER_DB;

export class GetUserService {
  async execute(): Promise<GetUserResult> {
    try {
      const users = await prismaClient.users.findMany();

      if (users.length === 0) {
        return ERROR_NOT_FOUND;
      }

      return users;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}

type GetUserByIdResult =
  | Awaited<ReturnType<typeof prismaClient.users.findUnique>>
  | typeof ERROR_INVALID_ID
  | typeof ERROR_NOT_FOUND
  | typeof ERROR_INTERNAL_SERVER_DB;

export class GetUserByIdService {
  async execute(id_user: number): Promise<GetUserByIdResult> {
    if (!id_user) {
      return ERROR_INVALID_ID;
    }

    try {
      const user = await prismaClient.users.findUnique({
        where: {
          id_user: id_user,
        },
      });

      if (!user) {
        return ERROR_NOT_FOUND;
      }

      return user;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}

type UpdateUserResult =
  | Awaited<ReturnType<typeof prismaClient.users.update>>
  | typeof ERROR_REQUIRED_FIELDS
  | typeof ERROR_INTERNAL_SERVER_DB;

interface UpdateUserData {
  name: string;
  email: string;
  passwordHash?: string;
}

export class UpdateUserService {
  async execute(
    id_user: number,
    { name, email, passwordHash }: UpdateUserData
  ): Promise<UpdateUserResult> {
    if (!id_user || !name || !email) {
      return ERROR_REQUIRED_FIELDS;
    }

    try {
      const updateData: { name: string; email: string; passwordHash?: string } =
        {
          name,
          email,
        };

      // Só atualiza a senha se uma nova foi fornecida
      if (passwordHash && passwordHash.trim() !== "") {
        updateData.passwordHash = await bcrypt.hash(passwordHash, 10);
      }

      const user = await prismaClient.users.update({
        where: {
          id_user: id_user,
        },
        data: updateData,
      });

      return user;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}

type DeleteUserResult =
  | Awaited<ReturnType<typeof prismaClient.users.delete>>
  | typeof ERROR_INVALID_ID
  | typeof ERROR_INTERNAL_SERVER_DB;

export class DeleteUserService {
  async execute(id_user: number): Promise<DeleteUserResult> {
    if (!id_user) {
      return ERROR_INVALID_ID;
    }

    try {
      const user = await prismaClient.users.delete({
        where: {
          id_user: id_user,
        },
      });

      return user;
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}

type LoginUserResult =
  | {
      user: {
        id_user: number;
        name: string;
        email: string;
      };
      token: string;
    }
  | typeof ERROR_REQUIRED_FIELDS
  | typeof ERROR_INVALID_CREDENTIALS
  | typeof ERROR_INTERNAL_SERVER_DB;

export class LoginUserService {
  async execute(email: string, password: string): Promise<LoginUserResult> {
    if (!email || !password) {
      return ERROR_REQUIRED_FIELDS;
    }

    try {
      const user = await prismaClient.users.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        return ERROR_INVALID_CREDENTIALS;
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        return ERROR_INVALID_CREDENTIALS;
      }

      const token = TokenJWT.generateToken({ id_user: user.id_user });

      return {
        user: {
          id_user: user.id_user,
          name: user.name,
          email: user.email,
        },
        token,
      };
    } catch (error) {
      console.log(ERROR_INTERNAL_SERVER_DB, error);
      return ERROR_INTERNAL_SERVER_DB;
    }
  }
}
