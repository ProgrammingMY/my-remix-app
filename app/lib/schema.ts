import { z } from "zod";

export const signupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    name: z.string().max(20, "Name cannot be longer than 20 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[0-9])(?=.*[!@#$%^&*])/,
        "Password must contain at least one number and one special character"
      ),
    retypePassword: z.string(),
  })
  .refine((data) => data.password === data.retypePassword, {
    message: "Passwords don't match",
    path: ["retypePassword"],
  });
