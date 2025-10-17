import Send from "@utils/response.utils";
import { prisma } from "@db/index";
import { Request, Response } from "express";
import { send } from "process";

const getUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // Extract userId from authenticated request

    // Fetch the user data from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // If the user is not found, return a 404 error
    if (!user) {
      Send.notFound(res, {}, "User not found");
    }

    // Return the user data in the response
    return Send.success(res, { user });
  } catch (error) {
    console.error("Error fetching user info:", error);
    Send.error(res, {}, "Internal server error");
  }
};

const userController = {
  getUser,
};

export default userController;
