import { ActionFunctionArgs } from "@remix-run/cloudflare";
import { createSupabaseServerClient } from "~/utils/supabase.server";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const { env } = context.cloudflare;
  console.log("logout");

  const { supabaseClient } = createSupabaseServerClient(request, env);

  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    return new Response(null, { status: 500 });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
    },
  });
};
