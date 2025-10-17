import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  status?: number;
  errors?: string[];
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  if (err.errors) {
    return res.status(err.status || 400).json({
      message: err.message,
      errors: err.errors, // express-validator array
    });
  }
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
};
