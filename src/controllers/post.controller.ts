import { prisma } from "@db/index";
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
    const { published, page = "1", limit = "10" } = req?.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    const skip = (pageNumber - 1) * pageSize;

    const isPublished = published !== undefined ? true : undefined;

    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        where: isPublished !== undefined ? { is_published: isPublished } : {},
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.post.count({
        where: isPublished !== undefined ? { is_published: isPublished } : {},
      }),
    ]);

    const totalPages = Math.ceil(totalPosts / pageSize);

    return Send.success(
      res,
      {
        posts,
        pagination: {
          totalPosts,
          totalPages,
          currentPage: pageNumber,
          pageSize,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1,
        },
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
    const { published, page = "1", limit = "10" } = req?.query;
    const { user_id } = req?.params;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    const isPublished = published !== undefined ? true : undefined;
    if (!user_id) return;
    const userId = user_id as string;

    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        where:
          isPublished !== undefined
            ? { is_published: isPublished, userId }
            : { userId },
      }),
      prisma.post.count({
        where:
          isPublished !== undefined
            ? { is_published: isPublished, userId }
            : { userId },
      }),
    ]);

    const totalPages = Math.ceil(totalPosts / pageSize);

    return Send.success(
      res,
      {
        posts,
        pagination: {
          totalPosts,
          totalPages,
          currentPage: pageNumber,
          pageSize,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1,
        },
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

    const { page = "1", limit = "10" } = req?.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    const [comments, totalComments] = await Promise.all([
      prisma.comment.findMany({
        where: { postId: post_id },
        select: {
          id: true,
          text: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      prisma.comment.count({
        where: { postId: post_id },
      }),
    ]);

    const totalPages = Math.ceil(totalComments / pageSize);

    return Send.success(
      res,
      {
        comments,
        pagination: {
          totalComments,
          totalPages,
          currentPage: pageNumber,
          pageSize,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1,
        },
      },
      "Comments successfully retreived."
    );
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

    const { page = "1", limit = "10" } = req?.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    const [likes, totalLikes] = await Promise.all([
      prisma.like.findMany({
        where: { postId: post_id },
        select: {
          id: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.like.count({
        where: { postId: post_id },
      }),
    ]);

    const totalPages = Math.ceil(totalLikes / pageSize);

    return Send.success(
      res,
      {
        likes,
        pagination: {
          totalLikes,
          totalPages,
          currentPage: pageNumber,
          pageSize,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1,
        },
      },
      "Likes successfully retreived."
    );
  } catch (error) {
    console.error("Error while getting likes of the post:", error);
    return Send.error(res, {}, "Getting Likes Failed.");
  }
};

const postController = {
  insertNewPost,
  getAllPosts,
  getAllPostsOfAUser,
  updatePost,
  deletePost,
  insertNewComment,
  getAllCommentsOfAPost,
  insertNewLike,
  getAllLikesOfAPost,
};

export default postController;
