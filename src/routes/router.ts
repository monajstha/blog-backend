import { Router, RequestHandler } from "express";

// Define supported HTTP methods
type RouteMethod = "get" | "post" | "put" | "delete" | "patch";

// Define route configuration
export interface RouteConfig {
  method: RouteMethod; // HTTP method (GET, POST, etc.)
  path: string; // Route path
  handler: RequestHandler; // Route handler (controller)
  middlewares?: RequestHandler[]; // Optional middlewares
}

/**
 * Creates and returns an Express Router based on a given list of routes.
 */
export function createRouter(routes: RouteConfig[]) {
  const router = Router();

  routes.forEach(({ method, path, handler, middlewares = [] }) => {
    // Apply middlewares + handler to the route dynamically
    router[method](path, ...middlewares, handler);
  });

  return router;
}
