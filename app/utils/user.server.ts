import bcrypt from "bcryptjs";
import * as schema from "~/db/schema.server";
import { drizzle } from "drizzle-orm/d1";
import { generateRandomRecoveryCode } from "./utils.server";
import { encryptString } from "./encryption.server";

// verify username, email and password

export const createUser = async (
  email: string,
  password: string,
  name: string,
  env: Env
) => {
  const db = drizzle(env.DB_drizzle, { schema });

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await db
    .insert(schema.user)
    .values({
      email,
      name,
      hashedPassword,
    })
    .returning();

  return user;
};
