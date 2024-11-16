import { json, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Outlet, useLoaderData } from "@remix-run/react"
import Navbar from "~/components/navbar/navbar";
import { AppSidebar } from "~/components/sidebar/app-sidebar";
import { SidebarProvider } from "~/components/ui/sidebar";
import { ClientUserType } from "~/lib/types";
import { isAuthenticated } from "~/utils/auth.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
    const { env } = context.cloudflare;

    const { user, headers } = await isAuthenticated(request, env);

    if (!user) {
        return redirect("/login", {
            headers
        });
    }

    return {
        user
    };
}

export default function Dashboard() {
    const { user } = useLoaderData<typeof loader>() as { user: ClientUserType };

    return (
        <SidebarProvider>
            <AppSidebar user={user} />
            <div className="h-[80px] fixed w-full top-0 z-40">
                <Navbar userName={user.name} />
            </div>
            <div className="h-full w-full">
                <main className="h-full mt-6 pt-[80px] p-6">
                    <Outlet context={{ user }} />
                </main>
            </div>
        </SidebarProvider>
    )

}
