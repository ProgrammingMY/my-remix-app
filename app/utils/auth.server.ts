import {
  commitSession,
  createSession,
  destroySession,
  generateSessionToken,
  getSession,
  invalidateSession,
  sessionStorage,
  validateSessionToken,
} from "~/utils/session.server";
import * as z from "zod";
import * as schema from "~/db/schema.server";
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { redirect } from "@remix-run/cloudflare";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  deleteEmailVerificationCookie,
  prepareEmailVerification,
  sendVerificationEmail,
  setEmailVerificationCookie,
} from "./verify.server";
import { removeGoogleSession } from "./google.server";
import { loginSchema, signupSchema } from "~/lib/schema";

export const sessionToken = "token";

export async function isAuthenticated(request: Request, env: Env) {
  const cookieSession = await getSession(request.headers.get("Cookie"));

  const token = cookieSession.get(sessionToken);

  const headers = new Headers();

  if (!token) {
    headers.append("Set-Cookie", await destroySession(cookieSession));
    return {
      user: null,
      headers,
    };
  }

  const { session, user } = await validateSessionToken(token, env);

  // if the session is not valid, invalidate it and redirect to the login page
  if (!session || !user || !user.emailVerified) {
    await invalidateSession(token, env);
    headers.append("Set-Cookie", await destroySession(cookieSession));
    return {
      user: null,
      headers,
    };
  }

  headers.append("Set-Cookie", await commitSession(cookieSession));

  return {
    user,
    headers,
  };
}

// redirect with encode url
export async function login(request: Request, env: Env) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: loginSchema });

  let headers = new Headers();
  let message = "";

  if (submission.status !== "success") {
    return {
      result: submission.reply(),
    };
  }

  const { email, password } = submission.value;

  const db = drizzle(env.DB_drizzle, { schema });

  const userInDb = await db.query.user.findFirst({
    where: eq(schema.user.email, email),
    columns: {
      id: true,
      hashedPassword: true,
      emailVerified: true,
      email: true,
    },
  });

  if (!userInDb) {
    return {
      result: submission.reply({ formErrors: ["Invalid email or password"] }),
    };
  }

  if (!userInDb.hashedPassword) {
    message = "You signed up with Google, please continue with Google";
    return {
      result: submission.reply({ formErrors: [message] }),
    };
  }

  const passwordMatch = await bcrypt.compare(password, userInDb.hashedPassword);

  if (!passwordMatch) {
    message = "Invalid email or password";
    return {
      result: submission.reply({ formErrors: [message] }),
    };
  }

  // if user is not verified
  if (!userInDb.emailVerified) {
    await startTOTPProcess(request, headers, userInDb.id, userInDb.email, env);
    return redirect("/verify", {
      headers,
    });
  }

  // create a new token session and store it in the database
  const token = generateSessionToken();
  await createSession(token, userInDb.id, db);

  // commit the session to the user's browser
  const session = await getSession();
  session.set(sessionToken, token);

  headers.append("Set-Cookie", await commitSession(session));

  return redirect("/user", {
    headers,
  });
}

export async function signup(request: Request, env: Env) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: signupSchema });

  let headers = new Headers();
  let message = "";

  if (submission.status !== "success") {
    return {
      result: submission.reply(),
    };
  }

  const { email, name, password } = submission.value;

  const db = drizzle(env.DB_drizzle, { schema });

  const existingUser = await db.query.user.findFirst({
    where: eq(schema.user.email, email.toLowerCase()),
  });

  if (existingUser && !existingUser.hashedPassword) {
    message = "You logged in with Google, please continue with Google";
    return {
      result: submission.reply({ formErrors: [message] }),
    };
  }

  // Handle existing unverified user
  if (existingUser && !existingUser.emailVerified) {
    // Update the existing user's information
    await db
      .update(schema.user)
      .set({
        name,
        hashedPassword: await bcrypt.hash(password, 12),
        imageUrl: env.DEFAULT_PIC_URL,
      })
      .where(eq(schema.user.id, existingUser.id));

    // Restart verification process
    await startTOTPProcess(
      request,
      headers,
      existingUser.id,
      existingUser.email,
      env
    );

    return redirect("/verify", {
      headers,
    });
  }

  if (existingUser && existingUser.emailVerified) {
    message = "Email already exists";
    return {
      result: submission.reply({ formErrors: [message] }),
    };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const studentRoleId = await db.query.role.findFirst({
    where: eq(schema.role.name, "student"),
    columns: {
      id: true,
    },
  });

  const user = await db
    .insert(schema.user)
    .values({
      email: email.toLowerCase(),
      name,
      hashedPassword,
      roleId: studentRoleId?.id,
      imageUrl: env.DEFAULT_PIC_URL,
    })
    .returning({
      id: schema.user.id,
      email: schema.user.email,
    });

  await startTOTPProcess(request, headers, user[0].id, user[0].email, env);

  return redirect("/verify", {
    headers,
  });
}

export async function logout(
  request: Request,
  env: Env,
  {
    redirectTo = "/login",
  }: {
    redirectTo?: string;
  }
) {
  const headers = new Headers();
  const cookieSession = await getSession(request.headers.get("Cookie"));
  const token = cookieSession.get(sessionToken);
  const { session } = await validateSessionToken(token, env);
  // if this fails, we still need to delete the session from the user's browser
  // and it doesn't do any harm staying in the db anyway.
  if (session) {
    await invalidateSession(session.id, env);
  }

  // remove google cookie if any
  await removeGoogleSession(request, headers);

  // destroy the session
  headers.append(
    "Set-Cookie",
    await sessionStorage.destroySession(cookieSession)
  );

  throw redirect(redirectTo, {
    headers,
  });
}

export async function startTOTPProcess(
  request: Request,
  headers: Headers,
  userId: string,
  email: string,
  env: Env
) {
  // delete existing email verification session
  await deleteEmailVerificationCookie(request, headers, env);

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
