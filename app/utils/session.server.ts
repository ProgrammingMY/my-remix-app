// app/services/session.server.ts
import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import {
  encodeBase32UpperCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { SessionType } from "~/db/schema.server";
import * as schema from "~/db/schema.server";

// omit multiple fields from the user type
type SafeUserType = {
  email: string;
  name: string | null;
  imageUrl: string | null;
  id: string;
  emailVerified: boolean;
  role: {
    name: string;
  } | null;
};

export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 days
export const getSessionExpirationDate = () =>
  new Date(Date.now() + SESSION_EXPIRATION_TIME);

// email verification cookie
export const verificationStorage = createCookieSessionStorage({
  cookie: {
    name: "_verification", // use any name you want here
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: ["supersecretcodeforauthsession"], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production", // enable this in prod only
  },
});

// export the whole sessionStorage object
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session", // use any name you want here
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: ["supersecretcodeforauthsession"], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production", // enable this in prod only
  },
});

// you can also export the methods individually for your own usage
export const { getSession, commitSession, destroySession } = sessionStorage;

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

  const result = await db.query.session.findFirst({
    where: eq(schema.session.id, sessionId),
    with: {
      user: {
        with: {
          role: {
            columns: {
              name: true,
            },
          },
        },
        columns: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
          emailVerified: true,
        },
      },
    },
  });

  // return null if session not found in the token
  if (!result) {
    return { session: null, user: null };
  }

  const { user, ...session } = result;

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
  | { session: SessionType; user: SafeUserType }
  | { session: null; user: null };
