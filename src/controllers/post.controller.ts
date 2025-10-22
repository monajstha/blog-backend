import { prisma } from "@db/index";
import Send from "@utils/response.utils";
import { Request, Response } from "express";

const insertNewPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, description, image_url, is_published } = req.body;
    console.log("New Post Request body: ", req.body);

    const newPost = await prisma.post.create({
      data: {
        title,
        description,
        image_url,
        is_published,
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
    Send.error(res, {}, "Creating New Post Failed.");
  }
};

const getAllPosts = async (req: Request, res: Response) => {
  try {
    const allPosts = await prisma.post.findMany();

    return Send.success(
      res,
      {
        posts: allPosts,
      },
      "Posts successfully retrieved"
    );
  } catch (error) {
    console.error("Error while getting posts:", error);
    Send.error(res, {}, "Getting Posts Failed.");
  }
};

const getAllUnpublishedPosts = async (req: Request, res: Response) => {
  try {
    const unpublishedPosts = await prisma.post.findMany({
      where: { is_published: false },
    });

    return Send.success(
      res,
      {
        posts: unpublishedPosts,
      },
      "Unpublished posts successfully retrieved."
    );
  } catch (error) {
    console.log("Error while getting unpublished posts:", error);
    Send.error(res, {}, "Getting Unpublished Posts Failed.");
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
    Send.error(res, {}, "Commenting On The Post Failed.");
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
    Send.error(res, {}, "Getting Comments Failed.");
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
    Send.error(res, {}, "Liking the Post Failed.");
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
    Send.error(res, {}, "Getting Likes Failed.");
  }
};

const postController = {
  insertNewPost,
  getAllPosts,
  getAllUnpublishedPosts,
  insertNewComment,
  getAllCommentsOfAPost,
  insertNewLike,
  getAllLikesOfAPost,
};

export default postController;
