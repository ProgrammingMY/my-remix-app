import { URL } from "node:url";
import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { createSupabaseServerClient } from "~/utils/supabase.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { env } = context.cloudflare;

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_url")?.toString();

  if (code) {
    const { supabaseClient } = createSupabaseServerClient(request, env);
    await supabaseClient.auth.exchangeCodeForSession(code);
  }

  if (redirectTo) {
    return redirect(`${origin}${redirectTo}`);
  }

  return redirect(`${origin}/user`);
}

export default function AuthCallbackPage() {
  return (
    <div>AuthCallbackPage</div>
  )
}
