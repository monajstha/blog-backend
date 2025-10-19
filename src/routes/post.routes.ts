import postController from "@controllers/post.controller";
import { createRouter, RouteConfig } from "./router";
import authMiddleware from "@middlewares/auth.middleware";
import validationMiddleware from "@middlewares/validation.middleware";
import postSchema from "validations/post.schema";

const routes: RouteConfig[] = [
  {
    // get all posts
    method: "get",
    path: "/",
    middlewares: [authMiddleware.authenticateUser],
    handler: postController.getAllPosts,
  },
  {
    // create a post
    method: "post",
    path: "/new",
    middlewares: [
      authMiddleware.authenticateUser,
      validationMiddleware.validateBody(postSchema.post),
    ],
    handler: postController.insertNewPost,
  },
];

export default createRouter(routes);
