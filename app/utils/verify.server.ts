import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import { generateRandomOTP } from "./utils.server";

import * as schema from "~/db/schema.server";
import { verificationStorage } from "./session.server";
import { and, eq } from "drizzle-orm";
import { sendEmail } from "./email.server";
import { verifyEmailTemplate } from "./template.server";

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
  env,
}: {
  request: Request;
  userId: string;
  email: string;
  env: Env;
}) {
  //   const verifyUrl = getRedirectToUrl({ request, type, target });
  //   const redirectTo = new URL(verifyUrl.toString());

  // create drizzle client
  const db = drizzle(env.DB_drizzle, { schema });

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
  code: string,
  env: Env
): Promise<void> {
  // send verification email with AWS SES
  const subject = "Your Verification Code";
  const text = `Your verification code is: ${code}`;
  const html = verifyEmailTemplate(code, env.APP_LOGO_URL);

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
    env,
  });
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
  env: Env
): Promise<void> {
  // create drizzle client
  const db = drizzle(env.DB_drizzle, { schema });

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

export async function getUserEmailVerificationRequest(id: string, env: Env) {
  // create drizzle client
  const db = drizzle(env.DB_drizzle, { schema });

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
  env: Env
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
    env
  );

  if (emailVerificationRequest === null) {
    await deleteEmailVerificationCookie(request, headers, env);
  }

  return emailVerificationRequest;
}

export async function createEmailVerificationRequest({
  request,
  headers,
  userId,
  email,
  env,
}: {
  request: Request;
  headers: Headers;
  userId: string;
  email: string;
  env: Env;
}) {
  // create drizzle client
  const db = drizzle(env.DB_drizzle, { schema });

  // create a verification request
  const verificationRequest = await prepareEmailVerification({
    request,
    userId,
    email,
    env,
  });

  // send a verification email to the user
  await sendVerificationEmail(
    verificationRequest.email,
    verificationRequest.code,
    env
  );

  // store the verification id in a cookie
  await setEmailVerificationCookie(headers, verificationRequest.id);
}

export async function verifyTotp({
  code,
  verificationId,
  userId,
  env,
}: {
  code?: string;
  verificationId: string;
  userId: string;
  env: Env;
}) {
  // create drizzle client
  const db = drizzle(env.DB_drizzle, { schema });

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
    };
  }

  return {
    error: null,
  };
}
