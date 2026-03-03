import { Router, type Request, type Response } from "express";
import { authMiddleware } from "./middlewares/middlewareAuth.js";
import {
  CreateUserController,
  DeleteUserController,
  GetUserByIdController,
  GetUserController,
  LoginUserController,
  UpdateUserController,
} from "./controllers/controller_user.js";
import {
  DeleteProductController,
  GetProductController,
  GetProductByIdController,
  CreateProductController,
  UpdateProductController,
  StockOutController,
} from "./controllers/controller_product.js";
import {
  CreateLoteController,
  UpdateLoteController,
  DeleteLoteController,
  GetLotesController,
  GetLoteByIdController,
} from "./controllers/controller_lote.js";
import {
  CreateKitController,
  UpdateKitController,
  DeleteKitController,
  GetKitsController,
  GetKitByIdController,
} from "./controllers/controller_kit.js";
// import { request } from "node:http";

const router = Router();

// User Routes
router.post("/user", async (request: Request, response: Response) =>
  new CreateUserController().handle(request, response),
);

router.put("/user/:id", authMiddleware, async (request, response) =>
  new UpdateUserController().handle(request, response),
);

router.get("/user/:id", authMiddleware, async (request, response) =>
  new GetUserByIdController().handle(request, response),
);

router.get("/user", async (request, response) =>
  new GetUserController().handle(request, response),
);

router.delete("/user/:id", authMiddleware, async (request, response) =>
  new DeleteUserController().handle(request, response),
);

router.post("/login", async (request: Request, response: Response) =>
  new LoginUserController().handle(request, response),
);

// Product Routes
router.post("/product", authMiddleware, async (request, response) =>
  new CreateProductController().handle(request, response),
);

router.put("/product/:id", authMiddleware, async (request, response) =>
  new UpdateProductController().handle(request, response),
);

router.get("/product/:id", authMiddleware, async (request, response) =>
  new GetProductByIdController().handle(request, response),
);

router.get("/product", authMiddleware, async (request, response) =>
  new GetProductController().handle(request, response),
);

router.delete("/product/:id", authMiddleware, async (request, response) =>
  new DeleteProductController().handle(request, response),
);

router.patch("/product/:id/baixa", authMiddleware, async (request, response) =>
  new StockOutController().handle(request, response),
);

// Lote Routes
router.post("/lote", authMiddleware, async (request, response) =>
  new CreateLoteController().handle(request, response),
);

router.put("/lote/:id", authMiddleware, async (request, response) =>
  new UpdateLoteController().handle(request, response),
);

router.get("/lote/:id", authMiddleware, async (request, response) =>
  new GetLoteByIdController().handle(request, response),
);

router.get("/lote", authMiddleware, async (request, response) =>
  new GetLotesController().handle(request, response),
);

router.delete("/lote/:id", authMiddleware, async (request, response) =>
  new DeleteLoteController().handle(request, response),
);

// Kit Routes
router.post("/kit", authMiddleware, async (request, response) =>
  new CreateKitController().handle(request, response),
);

router.put("/kit/:id", authMiddleware, async (request, response) =>
  new UpdateKitController().handle(request, response),
);

router.get("/kit/:id", authMiddleware, async (request, response) =>
  new GetKitByIdController().handle(request, response),
);

router.get("/kit", authMiddleware, async (request, response) =>
  new GetKitsController().handle(request, response),
);

router.delete("/kit/:id", authMiddleware, async (request, response) =>
  new DeleteKitController().handle(request, response),
);

export default router;
