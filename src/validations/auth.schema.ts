import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[0-9]/, "Password must include at least one number")
  .regex(/[@$!%*?&]/, "Password must include at least one special character");

const usernameSchema = z
  .string()
  .min(6, "Username must be at least 6 characters long")
  .max(20, "Username must not exceed 20 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, hyphens, and underscores"
  )
  .refine((value) => !/^\d+$/.test(value), {
    message: "Username cannot be only numbers",
  })
  .refine((value) => !/[@$!%*?&]/.test(value), {
    message: "Username cannot contain special characters like @$!%*?&",
  });

const login = z.object({
  username: usernameSchema,
  password: z.string().min(1, "Password is required"),
});

const register = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters long"),

    username: usernameSchema,
    email: z.string().email("Invalid email format"),
    password: passwordSchema,
    confirm_password: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

const authSchema = {
  login,
  register,
};

export default authSchema;
