import bcrypt from "bcryptjs";
import * as schema from "~/db/schema.server";
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { createSession, generateSessionToken } from "./session.server";
import { sessionStorage } from "./session.server";

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

export async function verifyUserEmail({
  userId,
  db,
}: {
  userId: string;
  db: DrizzleD1Database<typeof schema> & {
    $client: D1Database;
  };
}) {
  // set email verified
  const user = await db
    .update(schema.user)
    .set({
      emailVerified: true,
    })
    .where(eq(schema.user.id, userId))
    .returning({ id: schema.user.id });

  return user;
}

export async function startUserSession({
  userId,
  db,
  headers,
}: {
  userId: string;
  db: DrizzleD1Database<typeof schema> & {
    $client: D1Database;
  };
  headers: Headers;
}) {
  // commit the session to the user's browser
  const token = generateSessionToken();
  await createSession(token, userId, db);
  const session = await sessionStorage.getSession();
  session.set("token", token);
  headers.append("Set-Cookie", await sessionStorage.commitSession(session));
}
