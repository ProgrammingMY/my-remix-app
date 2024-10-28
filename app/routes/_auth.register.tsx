import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { Form, Link, useActionData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createSupabaseServerClient } from "~/utils/supabase.server";

export const action = async ({ request, context }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const origin = request.headers.get("Origin");

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return json({ success: false, message: "Email and password are required" })
    }

    const { env } = context.cloudflare;

    const { supabaseClient } = createSupabaseServerClient(request, env);

    const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`
        }
    });

    if (error) {
        return json({ success: false, message: "Something went wrong" })
    } else {
        return json({ success: true, message: "Thanks for signing up! Please check your email for a confirmation link." })
    }
}


export default function Register() {
    const actionResponse = useActionData<typeof action>();
    return (
        <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
            <Link
                to="/"
                className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
                >
                    <polyline points="15 18 9 12 15 6" />
                </svg>{" "}
                Back
            </Link>

            <Form method="post" className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground [&>input]:mb-6 max-w-md p-4">
                <h1 className="text-2xl font-medium">Sign up</h1>
                <p className="text-sm text text-foreground/60">
                    Already have an account?{" "}
                    <Link className="text-blue-600 font-medium underline" to="/login">
                        Log in
                    </Link>
                </p>
                <div className="mt-8 flex flex-col gap-2 [&>input]:mb-3">
                    <Label htmlFor="email">Email</Label>
                    <Input name="email" placeholder="you@example.com" />
                    <Label htmlFor="password">Password</Label>
                    <Input
                        type="password"
                        name="password"
                        placeholder="••••••••"

                    />
                    <Button type="submit" variant={"default"}>
                        Sign up
                    </Button>
                </div>
                {actionResponse && (
                    actionResponse.success ?
                        <p className="text-green-600">{actionResponse.message}</p>
                        :
                        <p className="text-red-600">{actionResponse.message}</p>
                )}
            </Form>
        </div>
    )
}
