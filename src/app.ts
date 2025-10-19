import { errorHandler } from "@middlewares/errorHandler";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
import authRoutes from "@routes/auth.routes";
import userRoutes from "@routes/user.routes";
import postRoutes from "@routes/post.routes";

const app = express();

app.use(express.json()); // this app level express middleware parses form data to req.body
app.use(cookieParser()); // Parse Cookie header and populate req.cookies with an object keyed by the cookie names
app.use(express.urlencoded({ extended: true })); // reads and turns html form submissions into nice JS objects
app.use(methodOverride("_method")); // look for ?_method=PUT in POST requests

app.use(
  cors({
    origin: [
      "http://localhost:3000", // your frontend url
      // 'https://mywebsite.com' // your production url optional
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);

// Handle all unmatched routes
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error("The page you are looking for isn't here :(");
  (error as any).status = 404;
  next(error);
});

// // Global error handler
// app.use(errorHandler);

export default app;
