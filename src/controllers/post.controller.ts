import { prisma } from "@db/index";
import { Post } from "@prisma/client";
import Send from "@utils/response.utils";
import { Request, Response } from "express";

const insertNewPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, description, image_url, is_published } = req.body;
    console.log(req.body);
    const newPost = await prisma.post.create({
      data: {
        title,
        description,
        image_url,
        is_published: Boolean(is_published),
        userId,
      },
    });

    return Send.success(
      res,
      {
        ...newPost,
      },
      "Post successfully created."
    );
  } catch (error) {
    console.error("Error inserting new post:", error);
    return Send.error(res, {}, "Creating New Post Failed.");
  }
};

const getAllPosts = async (req: Request, res: Response) => {
  try {
    const { published } = req?.query;

    const isPublished = published !== undefined ? true : undefined;

    const allPosts = await prisma.post.findMany({
      where: isPublished !== undefined ? { is_published: isPublished } : {},
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return Send.success(
      res,
      {
        posts: allPosts,
      },
      "Posts successfully retrieved"
    );
  } catch (error) {
    console.error("Error while getting posts:", error);
    return Send.error(res, {}, "Getting Posts Failed.");
  }
};

const getAllPostsOfAUser = async (req: Request, res: Response) => {
  try {
    const { published } = req?.query;
    const { user_id } = req?.params;

    const isPublished = published !== undefined ? true : undefined;
    if (!user_id) return;
    const userId = user_id as string;
    const allPosts = await prisma.post.findMany({
      where:
        isPublished !== undefined
          ? { is_published: isPublished, userId }
          : { userId },
    });

    return Send.success(
      res,
      {
        posts: allPosts,
      },
      "Posts successfully retrieved"
    );
  } catch (error) {
    console.error("Error while getting posts:", error);
    return Send.error(res, {}, "Getting Posts Failed.");
  }
};

const getAllPostsOfCurrentUser = async (req: Request, res: Response) => {
  try {
    const { published } = req?.query;
    const userId = (req as any).userId;

    const isPublished = published !== undefined ? true : undefined;

    const allPosts = await prisma.post.findMany({
      where:
        isPublished !== undefined
          ? { userId, is_published: isPublished }
          : { userId },
    });

    return Send.success(
      res,
      {
        posts: allPosts,
      },
      "Posts successfully retrieved"
    );
  } catch (error) {
    console.error("Error while getting posts:", error);
    return Send.error(res, {}, "Getting Posts Failed.");
  }
};

const updatePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { post_id } = req.params;
    if (!post_id) throw new Error("Post Id is required.");
    let updatedValues = { ...req.body };

    // Convert the is_published value to boolean
    if (updatedValues?.is_published) {
      updatedValues = {
        ...updatedValues,
        is_published: Boolean(updatedValues.is_published),
      };
    }

    const editPost = await prisma.post.update({
      where: { id: post_id },
      data: {
        ...updatedValues,
      },
    });

    return Send.success(
      res,
      {
        ...editPost,
      },
      "Post successfully updated."
    );
  } catch (error) {
    console.error("Error while editing the post:", error);
    return Send.error(res, {}, "Editing the Post Failed.");
  }
};

const deletePost = async (req: Request, res: Response) => {
  try {
    const { post_id } = req.params;
    const userId = (req as any).userId;

    if (!post_id)
      return Send.validationErrors(res, { post_id: ["Post ID is required"] });

    const deletedPost = await prisma.post.deleteMany({
      where: { id: post_id, userId },
    });
    if (deletedPost.count === 0) {
      return Send.unauthorized(
        res,
        {},
        "You are not authorised to delete this post."
      );
    }
    return Send.success(res, {}, "Post successfully deleted.");
  } catch (error) {
    console.error("Error while deleting the post:", error);
  }
};

// Comments
const insertNewComment = async (req: Request, res: Response) => {
  try {
    const { post_id } = req.params;
    if (!post_id) return;
    const userId = (req as any).userId;
    const { text } = req.body;
    if (!userId && !text) return;

    const newComment = await prisma.comment.create({
      data: { text, postId: post_id, userId },
    });

    const comments_count = await prisma.comment.count({
      where: { postId: post_id },
    });

    await prisma.post.update({
      data: { comments_count },
      where: { id: post_id },
    });

    return Send.success(
      res,
      {
        id: newComment.id,
        text: newComment.text,
        createdAt: newComment.createdAt,
        updatedAt: newComment.updatedAt,
      },
      "Successfully commented on the post."
    );
  } catch (error) {
    console.error("Error while inserting new comment:", error);
    return Send.error(res, {}, "Commenting On The Post Failed.");
  }
};

const getAllCommentsOfAPost = async (req: Request, res: Response) => {
  try {
    const { post_id } = req.params;
    if (!post_id) return;

    const comments = await prisma.comment.findMany({
      where: { postId: post_id },
      select: {
        id: true,
        text: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Send.success(res, { comments }, "Comments successfully retreived.");
  } catch (error) {
    console.error("Error while getting comments of the post:", error);
    return Send.error(res, {}, "Getting Comments Failed.");
  }
};

// Likes
const insertNewLike = async (req: Request, res: Response) => {
  try {
    const { post_id } = req.params;
    if (!post_id) return;
    const userId = (req as any).userId;

    const newLike = await prisma.like.create({
      data: { postId: post_id, userId },
    });

    const likes_count = await prisma.like.count();

    await prisma.post.update({
      data: { likes_count },
      where: { id: post_id },
    });

    return Send.success(
      res,
      {
        id: newLike.id,
        userId: newLike.userId,
        createdAt: newLike.createdAt,
        updatedAt: newLike.updatedAt,
      },
      "Successfully liked the post."
    );
  } catch (error) {
    console.error("Error while adding like on the post:", error);
    return Send.error(res, {}, "Liking the Post Failed.");
  }
};

const getAllLikesOfAPost = async (req: Request, res: Response) => {
  try {
    const { post_id } = req.params;
    if (!post_id) return;

    const likes = await prisma.like.findMany({
      where: { postId: post_id },
      select: {
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Send.success(res, { likes }, "Likes successfully retreived.");
  } catch (error) {
    console.error("Error while getting likes of the post:", error);
    return Send.error(res, {}, "Getting Likes Failed.");
  }
};

const postController = {
  insertNewPost,
  getAllPosts,
  getAllPostsOfCurrentUser,
  getAllPostsOfAUser,
  updatePost,
  deletePost,
  insertNewComment,
  getAllCommentsOfAPost,
  insertNewLike,
  getAllLikesOfAPost,
};

export default postController;
