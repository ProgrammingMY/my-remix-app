import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"
import { createSupabaseServerClient } from "~/utils/supabase.server";


export const loader = async ({ request, context }: LoaderFunctionArgs) => {
    const { env } = context.cloudflare;

    const { supabaseClient, headers } = createSupabaseServerClient(request, env);

    await supabaseClient.auth.signOut();

    return redirect("/", {
        headers
    });
}

export default function logout() {
    return (
        <div>User is logout</div>
    )
}
