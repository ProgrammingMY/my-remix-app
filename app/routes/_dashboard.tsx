import { json, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Outlet, useLoaderData } from "@remix-run/react"
import Navbar from "~/components/navbar/navbar";
import { AppSidebar } from "~/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
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
        <SidebarProvider>
            <AppSidebar />
            <div className="h-[80px] fixed w-full top-0 z-40">
                <Navbar />
            </div>
            <div className="h-full w-full">
                <main className="h-full mt-6 pt-[80px] p-6">
                    <Outlet />
                </main>
            </div>
        </SidebarProvider>
    )

}
