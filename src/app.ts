import { errorHandler } from "@middlewares/errorHandler";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import methodOverride from "method-override";
import authRoutes from "@routes/auth.routes";
import userRoutes from "@routes/user.routes";

const app = express();

app.use(express.json()); // this app level express middleware parses form data to req.body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method")); // look for ?_method=PUT in POST requests

app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Handle all unmatched routes
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error("The page you are looking for isn't here :(");
  (error as any).status = 404;
  next(error);
});

// // Global error handler
// app.use(errorHandler);

export default app;
