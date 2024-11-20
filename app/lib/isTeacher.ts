import { SafeUserType } from "./types";

export const isTeacher = (user: SafeUserType) => {
  return user.role?.name === "teacher" || user.role?.name === "admin";
};
