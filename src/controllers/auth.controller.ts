import Send from "@utils/response.utils";
import { prisma } from "@db/index";
import { Request, Response } from "express";
import authSchema from "validations/auth.schema";
import bcrypt from "bcrypt";
import { z } from "zod";
import jwt from "jsonwebtoken";
import authConfig from "@config/auth.config";

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body as z.infer<typeof authSchema.login>;
  try {
    // 1. Check if the username exists in the database
    const user = await prisma.user.findUnique({
      where: { username },
    });
    // If user doesn't exist, return an error
    if (!user) {
      return Send.unauthorized(res, null, "User not found");
    }

    // 2. Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return Send.unauthorized(res, null, "Invalid Credentials");
    }

    // 3. Generate an access token (JWT) with a short expiration time (e.g. 15 minutes)
    const accessToken = jwt.sign({ userId: user.id }, authConfig.secret, {
      expiresIn: authConfig.secret_expires_in as any,
    });

    // 4. Generate a refresh token with a longer expiration time (e.g. 7 days)
    const refreshToken = jwt.sign(
      { userId: user.id },
      authConfig.refresh_secret,
      { expiresIn: authConfig.refresh_secret_expires_in as any }
    );

    // 5. Store the refresh token in the database (optional)
    await prisma.user.update({
      where: { username },
      data: { refreshToken },
    });

    // 6. Set the access token and refresh token in HttpOnly cookies
    // This ensures that the tokens are not accessible via JavaScript and are sent automatically with each request
    // The access token expires quickly and is used for authenticating API requests
    // The refresh token is stored to allow renewing the access token when it expires
    res.cookie("accessToken", accessToken, {
      httpOnly: true, // Ensures the cookie cannot be accessed via JavaScript (security against XSS attacks)
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000, // minutes in milliseconds
      sameSite: "strict", // Ensures the cookie is sent only with requests from the same site
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // days in milliseconds
      sameSite: "strict",
    });

    // 7. Return a successful response with user's basic information (without sending tokens in the response body)
    return Send.success(res, {
      id: user.id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    // If any error occurs, return a generic error response
    console.error("Login Failed:", error); // Log the error for debugging
    return Send.error(res, null, "Login failed.");
  }
};

const register = async (req: Request, res: Response) => {
  const { name, username, email, password, confirm_password } =
    req.body as z.infer<typeof authSchema.register>;
  try {
    // 1. Check if the email already exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      Send.error(res, null, "Email already in use.");
    }

    // 2. Hash the password using bcrypt before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create a new user in the database with hashed password
    const newUser = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
      },
    });

    return Send.success(
      res,
      {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
      },
      "User successfully registered."
    );
  } catch (error) {
    console.error("Registration failed: ", error);
    return Send.error(res, null, "Registration Failed.");
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    // 1. We will ensure the user is authenticated before running this controller
    //    The authentication check will be done in the middleware (see auth.routes.ts).
    //    The middleware will check the presence of a valid access token in the cookies.

    // 2. Remove the refresh token from the database (optional, if using refresh tokens)
    const userId = (req as any).user?.userId; // Assumed that user data is added by the middleware;
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null }, // Clear the refresh token from the database
      });
    }

    // 3. Remove the access and refresh token cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    // 4. Send success response after logout
    return Send.success(res, null, "Logged out successfully.");
  } catch (error) {
    console.error("Logout Failed:", error);
    return Send.error(res, null, "Logout Failed.");
  }
};

const refreshToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // Get userId from the refreshTokenValidation middleware
    const refreshToken = req.cookies.refreshToken; // Get the refresh token from cookies

    // Check if the refresh token has been revoked
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      return Send.unauthorized(res, "Refresh token not found");
    }

    // Check if the refresh token in the database matches the one from the client
    if (user.refreshToken !== refreshToken) {
      return Send.unauthorized(res, { message: "Invalid refresh token" });
    }

    // Generate a new access token
    const newAccessToken = jwt.sign({ userId: user.id }, authConfig.secret, {
      expiresIn: authConfig.secret_expires_in as any,
    });

    // Send the new access token in the response
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: "strict",
    });

    return Send.success(res, {
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    console.error("Refresh Token Failed:", error);
    return Send.error(res, null, "Failed to refresh token");
  }
};

const authController = {
  login,
  register,
  logout,
  refreshToken,
};

export default authController;
