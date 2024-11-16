import { DrizzleD1Database } from "drizzle-orm/d1";
import { generateRandomOTP } from "./utils.server";

import * as schema from "~/db/schema.server";
import {
  createSession,
  generateSessionToken,
  sessionStorage,
  verificationStorage,
} from "./session.server";
import { and, eq } from "drizzle-orm";

type VerificationType = "onboarding" | "reset-password" | "2fa";

export function getDomainUrl(request: Request) {
  const host =
    request.headers.get("X-Forwarded-Host") ??
    request.headers.get("host") ??
    new URL(request.url).host;
  const protocol = request.headers.get("X-Forwarded-Proto") ?? "http";
  return `${protocol}://${host}`;
}

export function getRedirectToUrl({
  request,
  type,
  target,
  redirectTo,
}: {
  request: Request;
  type: VerificationType;
  target: string;
  redirectTo?: string;
}) {
  const redirectToUrl = new URL(`${getDomainUrl(request)}/verify`);
  redirectToUrl.searchParams.set("type", type);
  redirectToUrl.searchParams.set("target", target);
  if (redirectTo) {
    redirectToUrl.searchParams.set("redirectTo", redirectTo);
  }
  return redirectToUrl;
}

/**
 *
 * @param period - in milliseconds
 * @param request - the request object
 * @param type - the type of verification (onboarding, reset-password, 2fa)
 * @param target - the target of the verification (email, phone, etc)
 * @returns - the verification url and the redirect url
 */
export async function prepareEmailVerification({
  request,
  userId,
  email,
  db,
}: {
  request: Request;
  userId: string;
  email: string;
  db: DrizzleD1Database<typeof schema> & {
    $client: D1Database;
  };
}) {
  //   const verifyUrl = getRedirectToUrl({ request, type, target });
  //   const redirectTo = new URL(verifyUrl.toString());

  const code = generateRandomOTP();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10);

  const verification = await db
    .insert(schema.emailVerification)
    .values({
      code,
      expiresAt,
      userId,
      email,
    })
    .returning({ id: schema.emailVerification.id });

  return {
    id: verification[0].id,
    userId,
    code,
    email,
    expiresAt,
  };
}

export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<void> {
  // TODO: send verification email with resend
  console.log(`To ${email}: Your verification code is ${code}`);
}

export async function setEmailVerificationCookie(
  headers: Headers,
  verificationId: string
) {
  const verificationCookie = await verificationStorage.getSession();
  verificationCookie.set("emailVerification", verificationId);

  headers.append(
    "Set-Cookie",
    await verificationStorage.commitSession(verificationCookie)
  );
}

export async function deleteEmailVerificationCookie(
  request: Request,
  headers: Headers,
  db: DrizzleD1Database<typeof schema> & {
    $client: D1Database;
  }
): Promise<void> {
  const verificationCookie = await verificationStorage.getSession(
    request.headers.get("Cookie")
  );

  if (!verificationCookie) {
    return;
  }

  const emailVerificationId = verificationCookie.get("emailVerification");

  if (!emailVerificationId) {
    return;
  }

  await db
    .delete(schema.emailVerification)
    .where(eq(schema.emailVerification.id, emailVerificationId));

  headers.append(
    "Set-Cookie",
    await verificationStorage.destroySession(verificationCookie)
  );
}

export async function getUserEmailVerificationRequest(
  id: string,
  db: DrizzleD1Database<typeof schema> & {
    $client: D1Database;
  }
) {
  const emailVerification = await db.query.emailVerification.findFirst({
    where: and(eq(schema.emailVerification.id, id)),
    columns: {
      id: true,
      userId: true,
      expiresAt: true,
    },
  });

  if (!emailVerification) {
    return null;
  }

  return emailVerification;
}

export async function verifyEmailVerificationCookie(
  request: Request,
  headers: Headers,
  db: DrizzleD1Database<typeof schema> & {
    $client: D1Database;
  }
) {
  const verificationCookie = await verificationStorage.getSession(
    request.headers.get("cookie")
  );

  if (!verificationCookie) {
    return null;
  }

  const emailVerificationId = verificationCookie.get("emailVerification");

  if (!emailVerificationId) {
    return null;
  }

  const emailVerificationRequest = await getUserEmailVerificationRequest(
    emailVerificationId,
    db
  );

  if (emailVerificationRequest === null) {
    await deleteEmailVerificationCookie(request, headers, db);
  }

  return emailVerificationRequest;
}

export async function createEmailVerificationRequest({
  request,
  headers,
  userId,
  email,
  db,
}: {
  request: Request;
  headers: Headers;
  userId: string;
  email: string;
  db: DrizzleD1Database<typeof schema> & {
    $client: D1Database;
  };
}) {
  // create a verification request
  const verificationRequest = await prepareEmailVerification({
    request,
    userId,
    email,
    db,
  });

  // send a verification email to the user
  await sendVerificationEmail(
    verificationRequest.email,
    verificationRequest.code
  );

  // store the verification id in a cookie
  await setEmailVerificationCookie(headers, verificationRequest.id);
}

export async function verifyTotp({
  request,
  verificationId,
  headers,
  userId,
  db,
}: {
  request: Request;
  verificationId: string;
  headers: Headers;
  userId: string;
  db: DrizzleD1Database<typeof schema> & {
    $client: D1Database;
  };
}) {
  // verify the code
  const code = (await request.formData()).get("code");

  if (!code || typeof code !== "string" || code.length !== 6) {
    const error = {
      message: "Invalid code format",
    };
    return {
      error,
    };
  }

  const codeFromDb = await db.query.emailVerification.findFirst({
    where: and(
      eq(schema.emailVerification.userId, userId),
      eq(schema.emailVerification.id, verificationId)
    ),
    columns: {
      code: true,
      expiresAt: true,
    },
  });

  if (!codeFromDb) {
    const error = {
      message: "Cannot verify code, request another code",
    };
    return {
      error,
    };
  }

  if (Date.now() >= codeFromDb.expiresAt.getTime()) {
    const error = {
      message: "Code expired",
    };
    return {
      error,
    };
  }

  const isValidCode = codeFromDb.code === code;

  if (!isValidCode) {
    const error = {
      message: "Incorrect code",
    };
    return {
      error,
      headers,
    };
  }

  // remove the verification request
  await deleteEmailVerificationCookie(request, headers, db);

  // commit the session to the user's browser
  const token = generateSessionToken();
  await createSession(token, userId, db);
  const session = await sessionStorage.getSession();
  session.set("token", token);
  headers.append("Set-Cookie", await sessionStorage.commitSession(session));

  return {
    error: null,
  };
}
