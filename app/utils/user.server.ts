import bcrypt from "bcryptjs";
import * as schema from "~/db/schema.server";
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { createSession, generateSessionToken } from "./session.server";
import { sessionStorage } from "./session.server";
import { redirect } from "@remix-run/cloudflare";
import { parseWithZod } from "@conform-to/zod";
import { updateUserPasswordSchema } from "~/lib/schema";

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

export async function updateUsername({
  userId,
  name,
  env,
}: {
  userId: string;
  name: string;
  env: Env;
}) {
  const db = drizzle(env.DB_drizzle, { schema });

  const user = await db
    .update(schema.user)
    .set({
      name,
    })
    .where(eq(schema.user.id, userId))
    .returning({ id: schema.user.id });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function updateUserPassword({
  userId,
  request,
  env,
}: {
  userId: string;
  request: Request;
  env: Env;
}) {
  const db = drizzle(env.DB_drizzle, { schema });

  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: updateUserPasswordSchema,
  });
  if (submission.status !== "success") {
    return {
      result: submission.reply(),
    };
  }

  const { currentPassword, password } = submission.value;

  // check if current password is correct
  const user = await db.query.user.findFirst({
    where: eq(schema.user.id, userId),
  });

  if (!user) {
    return redirect("/login");
  }

  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.hashedPassword!
  );

  if (!isPasswordCorrect) {
    return {
      result: submission.reply({ formErrors: ["Current password incorrect"] }),
    };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await db
    .update(schema.user)
    .set({
      hashedPassword,
    })
    .where(eq(schema.user.id, userId))
    .returning({ id: schema.user.id });

  return null;
}

// TODO: upload profile picture to cloudflare r2
export async function updateUserPicture({
  userId,
  imageUrl,
  env,
}: {
  userId: string;
  imageUrl: string;
  env: Env;
}) {
  const db = drizzle(env.DB_drizzle, { schema });

  // upload image to cloudflare r2

  const user = await db
    .update(schema.user)
    .set({
      imageUrl,
    })
    .where(eq(schema.user.id, userId))
    .returning({ id: schema.user.id });

  return user;
}
