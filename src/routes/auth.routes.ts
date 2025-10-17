import validationMiddleware from "@middlewares/validation.middleware";
import { createRouter, RouteConfig } from "./router";
import authSchema from "validations/auth.schema";
import authController from "@controllers/auth.controller";
import authMiddleware from "@middlewares/auth.middleware";

const routes: RouteConfig[] = [
  {
    // login
    method: "post",
    path: "/login",
    middlewares: [validationMiddleware.validateBody(authSchema.login)],
    handler: authController.login,
  },
  {
    // register
    method: "post",
    path: "/register",
    middlewares: [validationMiddleware.validateBody(authSchema.register)],
    handler: authController.register,
  },
  {
    // logout
    method: "post",
    path: "/logout",
    middlewares: [
      // check if user is logged in
      authMiddleware.authenticateUser,
    ],
    handler: authController.logout,
  },

  {
    // refresh token
    method: "post",
    path: "/refresh-token",
    middlewares: [
      // checks if refresh token is valid
      authMiddleware.refreshTokenValidation,
    ],
    handler: authController.refreshToken,
  },
];

export default createRouter(routes);
