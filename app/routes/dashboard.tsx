import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { Form, redirect, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { isAuthenticated, logout } from "~/utils/auth.server";

export const action = async ({ request, context }: ActionFunctionArgs) => {
    const { env } = context.cloudflare;
    return await logout(request, env, {
        redirectTo: "/testlogin",
    })
}

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
    const { env } = context.cloudflare;

    const user = await isAuthenticated(request, env, {
        failedRedirect: "/testlogin",
    })

    if (!user) {
        return redirect("/testlogin");
    }

    return user;
}

export default function DashboardTest() {
    return (
        <div>
            You are logged in
            <Form method="post">
                <Button type="submit" variant="outline">
                    Logout
                </Button>
            </Form>
        </div>
    )
}
