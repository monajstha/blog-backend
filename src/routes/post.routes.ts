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
      validationMiddleware.validateBody(postSchema.create),
    ],
    handler: postController.insertNewPost,
  },
  {
    // Update a post
    method: "patch",
    path: "/:post_id",
    middlewares: [
      authMiddleware.authenticateUser,
      validationMiddleware.validateBody(postSchema.update),
    ],
    handler: postController.updatePost,
  },
  {
    // Update a post
    method: "delete",
    path: "/:post_id",
    middlewares: [authMiddleware.authenticateUser],
    handler: postController.deletePost,
  },
  {
    // add comment on a post
    method: "post",
    path: "/:post_id/comments/new",
    middlewares: [
      authMiddleware.authenticateUser,
      validationMiddleware.validateBody(postSchema.comment),
    ],
    handler: postController.insertNewComment,
  },
  {
    // get all comments of a post
    method: "get",
    path: "/:post_id/comments",
    middlewares: [authMiddleware.authenticateUser],
    handler: postController.getAllCommentsOfAPost,
  },
  {
    // add comment on a post
    method: "post",
    path: "/:post_id/likes/new",
    middlewares: [authMiddleware.authenticateUser],
    handler: postController.insertNewLike,
  },
  {
    // get all comments of a post
    method: "get",
    path: "/:post_id/likes",
    middlewares: [authMiddleware.authenticateUser],
    handler: postController.getAllLikesOfAPost,
  },
];

export default createRouter(routes);
