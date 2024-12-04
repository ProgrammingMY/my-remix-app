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

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string(),
});

export const updateUsernameSchema = z.object({
  name: z.string().max(20, "Name cannot be longer than 20 characters"),
});

export const updateUserPictureSchema = z.object({
  picture: z.instanceof(File),
});

export const updateUserPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    retypePassword: z.string(),
  })
  .refine((data) => data.password === data.retypePassword, {
    message: "Passwords don't match",
    path: ["retypePassword"],
  });

export const updateProfileSchema = z
  .object({
    intent: z.enum([
      "updateUsername",
      "updateUserPicture",
      "updateUserPassword",
    ]),
    name: z.string().max(20, "Name cannot be longer than 20 characters"),
    picture: z.instanceof(File),
    currentPassword: z.string().min(1, "Current password is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    retypePassword: z.string(),
  })
  .refine(
    (data) =>
      data.intent === "updateUserPassword" &&
      data.currentPassword !== data.password,
    {
      message: "New password cannot be the same as the current password",
      path: ["password"],
    }
  )
  .refine(
    (data) =>
      data.intent === "updateUsername" &&
      data.name.length > 0 &&
      data.name.length <= 20,
    {
      message: "Name cannot be empty or longer than 20 characters",
      path: ["name"],
    }
  )
  .refine((data) => data.intent === "updateUserPicture" && data.picture, {
    message: "Picture is required",
    path: ["picture"],
  });
