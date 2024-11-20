import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { generateCodeVerifier, generateState } from "arctic";
import {
  createGoogleClient,
  googleSessionStorage,
} from "~/utils/google.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { env } = context.cloudflare;

  const google = createGoogleClient(env);

  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);

  // create session
  const session = await googleSessionStorage.getSession();
  session.set("google_oauth_state", state);
  session.set("google_code_verifier", codeVerifier);

  return redirect(url.toString(), {
    headers: {
      "Set-Cookie": await googleSessionStorage.commitSession(session),
    },
  });
};
