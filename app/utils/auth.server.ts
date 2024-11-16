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
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { redirect } from "@remix-run/cloudflare";
import {
  prepareEmailVerification,
  sendVerificationEmail,
  setEmailVerificationCookie,
} from "./verify.server";

export const sessionToken = "token";

const payloadSchema = z.object({
  email: z.string(),
  password: z.string(),
});

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
  if (!session || !user) {
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

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  let headers = new Headers();

  if (!email || !password) {
    const error = new Error();
    error.message = "Email or password is required";
    return {
      error,
      headers,
    };
  }

  const db = drizzle(env.DB_drizzle, { schema });
  const userInDb = await db.query.user.findFirst({
    where: eq(schema.user.email, email),
    columns: {
      id: true,
      hashedPassword: true,
    },
  });

  if (!userInDb || !userInDb.hashedPassword) {
    //return json({ success: false, message: "Invalid email or password" });
    const error = new Error();
    error.message = "Invalid email or password";
    return {
      error,
      headers,
    };
  }

  const passwordMatch = await bcrypt.compare(password, userInDb.hashedPassword);

  if (!passwordMatch) {
    // return json({ success: false, message: "Invalid email or password" });
    const error = new Error();
    error.message = "Invalid email or password";
    return {
      error,
      headers,
    };
  }

  // create a new token session and store it in the database
  const token = generateSessionToken();
  await createSession(token, userInDb.id, db);

  // commit the session to the user's browser
  const session = await getSession();
  session.set(sessionToken, token);

  headers.append("Set-Cookie", await commitSession(session));

  return { error: undefined, headers };
}

export async function signup(request: Request, env: Env) {
  const formData = await request.formData();

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;

  // TODO: validate input

  let headers = new Headers();

  if (!email || !name || !password) {
    const error = new Error("Email, name and password are required");
    return {
      error,
      headers,
    };
  }

  const db = drizzle(env.DB_drizzle, { schema });

  const existingUser = await db.query.user.findFirst({
    where: eq(schema.user.email, email.toLowerCase()),
  });

  if (existingUser) {
    const error = new Error();
    error.message = "Email already exists";
    return {
      error,
      headers,
    };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await db
    .insert(schema.user)
    .values({
      email: email.toLowerCase(),
      name,
      hashedPassword,
    })
    .returning({
      id: schema.user.id,
      email: schema.user.email,
    });

  // create a verification request
  const verificationRequest = await prepareEmailVerification({
    request,
    userId: user[0].id,
    email: user[0].email,
    db: drizzle(env.DB_drizzle, { schema }),
  });

  // send a verification email to the user
  await sendVerificationEmail(
    verificationRequest.email,
    verificationRequest.code
  );

  // store the verification id in a cookie
  await setEmailVerificationCookie(headers, verificationRequest.id);

  return {
    error: null,
    headers,
  };
}

export async function logout(
  request: Request,
  env: Env,
  {
    redirectTo = "/",
  }: {
    redirectTo?: string;
  }
) {
  const cookieSession = await getSession(request.headers.get("Cookie"));
  const token = cookieSession.get(sessionToken);
  const { session } = await validateSessionToken(token, env);
  // if this fails, we still need to delete the session from the user's browser
  // and it doesn't do any harm staying in the db anyway.
  console.log(session);
  if (session) {
    await invalidateSession(session.id, env);
  }
  throw redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(cookieSession),
    },
  });
}
