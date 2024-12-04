import { createCookieSessionStorage, redirect } from "@remix-run/cloudflare";

const cookieName = "_confetti";

// create confetti flash session
export const confettiStorage = createCookieSessionStorage({
  cookie: {
    name: cookieName,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: ["s3cr3t"],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getConfetti(request: Request) {
  const session = await confettiStorage.getSession(
    request.headers.get("Cookie")
  );

  const confetti = session.get(cookieName);

  // Clear the confetti value after reading it
  session.unset(cookieName);

  return {
    confetti,
    headers: {
      "Set-Cookie": await confettiStorage.commitSession(session),
    },
  };
}

// set confetti flash
export async function setConfetti(request: Request, confetti: string) {
  const session = await confettiStorage.getSession(
    request.headers.get("Cookie")
  );

  session.set(cookieName, confetti);

  return {
    headers: {
      "Set-Cookie": await confettiStorage.commitSession(session),
    },
  };
}

// invalidate confetti flash
export async function invalidateConfetti(request: Request) {
  const session = await confettiStorage.getSession(
    request.headers.get("Cookie")
  );
  return {
    headers: {
      "Set-Cookie": await confettiStorage.destroySession(session),
    },
  };
}

// redirect with confetti and set confetti flash
export async function redirectWithConfetti(request: Request, location: string) {
  const { headers } = await setConfetti(request, "true");
  return redirect(location, { headers });
}
