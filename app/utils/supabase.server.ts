import {
  createServerClient,
  serializeCookieHeader,
  parseCookieHeader,
} from "@supabase/ssr";

export function createSupabaseServerClient(request: Request, env: Env) {
  const cookies = parseCookieHeader(request.headers.get("Cookie") ?? "");
  const headers = new Headers();

  const supabaseClient = createServerClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookies;
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options)
            );
          });
        },
      },
    }
  );

  return { supabaseClient, headers };
}
