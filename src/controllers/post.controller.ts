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
        id: newPost.id,
        title: newPost.title,
        description: newPost.description,
        image_url: newPost.image_url,
        is_published: newPost.is_published,
        userId: newPost.userId,
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

const postController = {
  insertNewPost,
  getAllPosts,
};

export default postController;
