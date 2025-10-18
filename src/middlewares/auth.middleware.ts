import authConfig from "@config/auth.config";
import Send from "@utils/response.utils";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface IDecodedToken {
  userId: String;
}

const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Extract the access token from the HttpOnly cookie
  const token = req.cookies?.accessToken;
  console.log("Cookies", req, req.cookies);

  if (!token) {
    return Send.unauthorized(res, null);
  }

  try {
    // 2. Verify the token using the secret from the auth config
    const decodedToken = jwt.verify(token, authConfig.secret) as IDecodedToken; // Type assertion for better type safety

    // 3. If the token is valid, attaach user information to the request object
    (req as any).userId = decodedToken.userId; // Attach userId to the request object

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Authentication Failed", error);
    return Send.unauthorized(res, null);
  }
};

const refreshTokenValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Extract the refresh token from the HttpOnly cookie
  const refreshToken = req.cookies?.refreshToken;

  // If there is no refresh token, return an error
  if (!refreshToken) {
    return Send.unauthorized(res, { message: "No refresh token provided" });
  }

  try {
    // 2. Verify the refresh token using the secret from the auth config
    const decodedToken = jwt.verify(
      refreshToken,
      authConfig.refresh_secret
    ) as IDecodedToken;

    // If the token is valid, attach user information to the request object
    (req as any).userId = decodedToken.userId;

    // Proceed to the next middleware or the route handler
    next();
  } catch (error) {
    console.error("Refresh Token authentication failed:", error);
    return Send.unauthorized(res, {
      message: "Invalid or expired refresh token",
    });
  }
};

const authMiddleware = {
  authenticateUser,
  refreshTokenValidation,
};

export default authMiddleware;
