import validationMiddleware from "@middlewares/validation.middleware";
import { createRouter, RouteConfig } from "./router";
import authSchema from "validations/auth.schema";
import authController from "@controllers/auth.controller";
import authMiddleware from "@middlewares/auth.middleware";
import userController from "@controllers/user.controller";

const routes: RouteConfig[] = [
  {
    // get user info
    method: "get",
    path: "/info", // api/user/info
    middlewares: [authMiddleware.authenticateUser],
    handler: userController.getUser,
  },
];

export default createRouter(routes);
