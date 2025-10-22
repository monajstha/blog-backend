import { z } from "zod";

const booleanLike = z.preprocess((val) => {
  // If it's already a boolean, return as-is
  if (typeof val === "boolean") return val;

  // Strings: "true", "false", "1", "0"
  if (typeof val === "string") {
    const s = val.trim().toLowerCase();
    if (s === "true" || s === "1") return true;
    if (s === "false" || s === "0") return false;
    // empty string => treat as undefined so optional works
    if (s === "") return undefined;
  }

  // Numbers: 1 => true, 0 => false
  if (typeof val === "number") {
    return val === 1 ? true : val === 0 ? false : val;
  }

  // Everything else: pass through (will be rejected by z.boolean())
  return val;
}, z.boolean());

const create = z.object({
  title: z.string().min(2, "Title must be at least 2 characters long"),
  description: z
    .string()
    .min(2, "Description must be at least 2 characters long!"),
  image_url: z.url("Must be a valid url").optional(),
  is_published: booleanLike.optional(),
});

const update = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters long")
    .optional(),
  description: z
    .string()
    .min(2, "Description must be at least 2 characters long!")
    .optional(),
  image_url: z.url("Must be a valid url").optional(),
  is_published: z
    .union([z.boolean(), z.string()])
    .transform((val) => val === true || val === "true")
    .optional(),
});

const comment = z.object({
  text: z.string().min(1, "Comment must be at least one character long"),
});

const postSchema = {
  create,
  update,
  comment,
};

export default postSchema;
