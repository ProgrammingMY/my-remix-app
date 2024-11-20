import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { Google } from "arctic";

export function createGoogleClient(env: Env) {
  return new Google(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    "http://localhost:5173/api/auth/callback/google"
  );
}

// Create session storage
export const googleSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "google_oauth_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: ["supersecretcodeforauthsession"], // Make sure to set this in your environment
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getGoogleSession(request: Request) {
  const session = await googleSessionStorage.getSession(
    request.headers.get("Cookie")
  );
  return session;
}

export async function removeGoogleSession(request: Request, headers: Headers) {
  const session = await googleSessionStorage.getSession(
    request.headers.get("Cookie")
  );
  headers.append(
    "Set-Cookie",
    await googleSessionStorage.destroySession(session)
  );
}
