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
            {/* <SidebarTrigger /> */}
            <div className="h-full w-full">
                <div className="h-[80px] p-6 py-2 z-50">
                    <Navbar />
                </div>
                <main className="h-full p-6">
                    <Outlet />
                </main>
            </div>
        </SidebarProvider>
    )

}
