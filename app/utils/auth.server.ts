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

export const sessionToken = "token";

const payloadSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export async function isAuthenticated(
  request: Request,
  env: Env,
  {
    failedRedirect,
    successRedirect,
  }: {
    failedRedirect?: string;
    successRedirect?: string;
  }
) {
  const cookieSession = await getSession(request.headers.get("Cookie"));

  const token = cookieSession.get(sessionToken);

  if (!token && failedRedirect) {
    return redirect(failedRedirect, {
      headers: {
        "Set-Cookie": await destroySession(cookieSession),
      },
    });
  }

  const { session, user } = await validateSessionToken(token, env);

  // if the session is not valid, invalidate it and redirect to the login page
  if ((!session || !user) && failedRedirect) {
    await invalidateSession(token, env);
    return redirect(failedRedirect, {
      headers: {
        "Set-Cookie": await destroySession(cookieSession),
      },
    });
  }

  if (user) {
    if (successRedirect) {
      return redirect(successRedirect, {
        headers: {
          "Set-Cookie": await commitSession(cookieSession),
        },
      });
    }

    return user;
  }

  return null;
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

  const headers = new Headers();

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
    });

  // TODO: send a verification email to the user

  const token = generateSessionToken();
  await createSession(token, user[0].id, db);

  // commit the session to the user's browser
  const session = await getSession();
  session.set(sessionToken, token);

  headers.append("Set-Cookie", await commitSession(session));

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
  const authSession = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const sessionId = authSession.get(sessionToken);
  // if this fails, we still need to delete the session from the user's browser
  // and it doesn't do any harm staying in the db anyway.
  const db = drizzle(env.DB_drizzle, { schema });
  if (sessionId) {
    await db.delete(schema.session).where(eq(schema.session.id, sessionId));
  }
  throw redirect(redirectTo, {
    headers: { "Set-Cookie": await sessionStorage.destroySession(authSession) },
  });
}
