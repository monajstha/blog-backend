import { createRouter, RouteConfig } from "./router";
import authMiddleware from "@middlewares/auth.middleware";
import userController from "@controllers/user.controller";
import postController from "@controllers/post.controller";

const routes: RouteConfig[] = [
  {
    // get user info
    method: "get",
    path: "/:user_id/info",
    middlewares: [authMiddleware.authenticateUser],
    handler: userController.getUser,
  },
  {
    // Get user's posts
    method: "get",
    path: "/:user_id/posts",
    middlewares: [authMiddleware.authenticateUser],
    handler: postController.getAllPostsOfAUser,
  },
];

export default createRouter(routes);
