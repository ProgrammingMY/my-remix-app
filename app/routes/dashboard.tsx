import { json, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react"
import { createSupabaseServerClient } from "~/utils/supabase.server";

export const loader = async ({ context, params, request }: LoaderFunctionArgs) => {
    const { env } = context.cloudflare;

    const { supabaseClient, headers } = createSupabaseServerClient(request, env);

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    return { id: user.id };
}

export default function Dashboard() {
    const data: any = useLoaderData();

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome {data.id}</p>
        </div>
    )
}
