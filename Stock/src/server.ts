import Express from "express";
import cors from "cors";
import BodyParser from "body-parser";
import router from "./routes.js";
import dotenv from "dotenv";

dotenv.config();

const app = Express();

const start = async function () {
  app.use(cors());
  app.use(BodyParser.json());
  app.use(router);

  try {
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    console.log("Error starting server:", error);
    process.exit(1);
  }
};

start();
