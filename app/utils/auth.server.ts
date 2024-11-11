// app/services/auth.server.ts
import { Authenticator } from "remix-auth";
import { SessionType, UserType } from "~/db/schema.server";
import { sessionStorage } from "~/utils/session.server";
import * as z from "zod";
import * as schema from "~/db/schema.server";
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { combineHeaders } from "./utils.server";
import { redirect } from "@remix-run/cloudflare";
import {
  encodeBase32UpperCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 days
export const getSessionExpirationDate = () =>
  new Date(Date.now() + SESSION_EXPIRATION_TIME);

export const sessionKey = "sessionId";

const payloadSchema = z.object({
  email: z.string(),
  password: z.string(),
});

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<any>(sessionStorage);

export async function login({
  email,
  password,
  env,
}: {
  email: UserType["email"];
  password: string;
  env: Env;
}) {
  const db = drizzle(env.DB_drizzle, { schema });
  const userInDb = await db.query.user.findFirst({
    where: eq(schema.user.email, email),
    columns: {
      id: true,
      hashedPassword: true,
    },
  });

  if (!userInDb || !userInDb.hashedPassword) return null;

  const passwordMatch = await bcrypt.compare(password, userInDb.hashedPassword);

  if (!passwordMatch) return null;

  const token = generateSessionToken();
  const session = await createSession(token, userInDb.id, db);

  return session;
}

export async function signup({
  email,
  password,
  name,
  env,
}: {
  email: UserType["email"];
  name: UserType["name"];
  password: string;
  env: Env;
}) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const db = drizzle(env.DB_drizzle, { schema });

  const user = await db
    .insert(schema.user)
    .values({
      email: email.toLowerCase(),
      name,
      hashedPassword,
    })
    .returning({
      id: schema.user.id,
    });

  const token = generateSessionToken();
  const session = await createSession(token, user[0].id, db);

  return session;
}

export async function logout(
  {
    request,
    redirectTo = "/",
    env,
  }: {
    request: Request;
    redirectTo?: string;
    env: Env;
  },
  responseInit?: ResponseInit
) {
  const authSession = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const sessionId = authSession.get(sessionKey);
  // if this fails, we still need to delete the session from the user's browser
  // and it doesn't do any harm staying in the db anyway.
  const db = drizzle(env.DB_drizzle, { schema });
  if (sessionId) {
    await db.delete(schema.session).where(eq(schema.session.id, sessionId));
  }
  throw redirect(redirectTo, {
    ...responseInit,
    headers: combineHeaders(
      { "set-cookie": await sessionStorage.destroySession(authSession) },
      responseInit?.headers
    ),
  });
}

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32UpperCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  token: string,
  userId: string,
  db: DrizzleD1Database<typeof schema> & {
    $client: D1Database;
  }
): Promise<SessionType> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session = await db
    .insert(schema.session)
    .values({
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + SESSION_EXPIRATION_TIME),
    })
    .returning();
  return session[0];
}

export async function validateSessionToken(
  token: string,
  env: Env
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const db = drizzle(env.DB_drizzle, { schema });
  const result = await db
    .select({ user: schema.user, session: schema.session })
    .from(schema.session)
    .innerJoin(schema.user, eq(schema.session.userId, schema.user.id))
    .where(eq(schema.session.id, sessionId));

  // return null if session not found in the token
  if (result.length < 1) {
    return { session: null, user: null };
  }
  const { user, session } = result[0];

  // delete session if past expired date
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(schema.session).where(eq(schema.session.id, session.id));
    return { session: null, user: null };
  }

  // extend expiry date if less than 15 days
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(schema.session)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(schema.session.id, session.id));
  }
  return { session, user };
}

export async function invalidateSession(
  sessionId: string,
  env: Env
): Promise<void> {
  const db = drizzle(env.DB_drizzle, { schema });

  await db.delete(schema.session).where(eq(schema.session.id, sessionId));
}

export type SessionValidationResult =
  | { session: SessionType; user: UserType }
  | { session: null; user: null };
