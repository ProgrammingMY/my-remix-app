import { json, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Outlet, useLoaderData } from "@remix-run/react"
import Navbar from "~/components/navbar/navbar";
import { createSupabaseServerClient } from "~/utils/supabase.server";

// export const loader = async ({ context, request }: LoaderFunctionArgs) => {
//     const { env } = context.cloudflare;

//     const { supabaseClient, headers } = createSupabaseServerClient(request, env);

//     const { data: { user } } = await supabaseClient.auth.getUser();

//     if (!user) {
//         return redirect("/login", {
//             headers
//         });
//     }

//     return { id: user.id };
// }

export default function Dashboard() {
    return (
        <div className="h-full">
            <div className="h-[80px] w-full fixed inset-y-0 z-50">
                <Navbar />
            </div>
            <main className="pt-[80px] h-full">
                <Outlet />
            </main>

        </div>
    )

}
