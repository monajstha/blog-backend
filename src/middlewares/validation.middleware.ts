import Send from "@utils/response.utils";
import { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";

const validateBody = (schema: ZodType<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format errors like {email: ['error1', 'error2'], password: ['error1']}
        const formattedErrors: Record<string, string[]> = {};

        error.issues.forEach((err) => {
          const field = err.path.join(".");
          if (!formattedErrors[field]) {
            formattedErrors[field] = [];
          }
          formattedErrors[field].push(err.message); // Add validation message
        });
        return Send.validationErrors(res, formattedErrors);
      }
      // If it's another type of error, send a generic error response
      return Send.error(res, "Invalid request data");
    }
  };
};

const validationMiddleware = {
  validateBody,
};

export default validationMiddleware;
