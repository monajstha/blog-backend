import z from "zod/v3";

const post = z.object({
  title: z.string().min(2, "Title must be at least 2 characters long"),
  description: z
    .string()
    .min(2, "Description must be at least 2 characters long!"),
  image_url: z.string().url("Must be a valid url").optional(),
  is_published: z.boolean().optional(),
});

const comment = z.object({
  text: z.string().min(1, "Comment must be at least one character long"),
});

const postSchema = {
  post,
  comment,
};

export default postSchema;
