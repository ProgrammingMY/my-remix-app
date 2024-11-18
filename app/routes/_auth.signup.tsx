import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, Link, redirect, useActionData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import { isAuthenticated, signup } from "~/utils/auth.server"

export async function loader({ request, context }: LoaderFunctionArgs) {
    const { env } = context.cloudflare;

    const { user, headers } = await isAuthenticated(request, env);

    if (user && user.emailVerified) {
        return redirect("/user", {
            headers
        });
    }

    return null;
};

export const action = async ({ request, context }: ActionFunctionArgs) => {

    const { env } = context.cloudflare;

    const { error, headers } = await signup(request, env);

    // TODO: redirect to verify email
    if (!error) {
        return redirect("/verify", {
            headers
        });
    }

    return json({ error });

}
// First we create our UI with the form doing a POST and the inputs with the
// names we are going to use in the strategy
export default function Screen() {
    const actionData = useActionData<typeof action>();

    return (
        <div className="flex flex-col justify-center py-8">
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
            <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Sign Up</h1>
                <p className="text-balance text-muted-foreground">
                    Let's start your journey!
                </p>
            </div>

            <Form method="POST">
                <div className="flex flex-col gap-y-4 mt-8">
                    <div className="grid gap-2">
                        <Label htmlFor="email">
                            Email
                        </Label>
                        <Input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="name">
                            Name
                        </Label>
                        <Input
                            type="text"
                            name="name"
                            id="name"
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">
                            Password
                        </Label>
                        <Input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    {actionData && actionData?.error && <p className="text-red-600">{actionData.error.message}</p>}
                    <Button
                        className="w-full"
                        type="submit"
                    >
                        Sign Up
                    </Button>
                    <Button
                        className="w-full"
                        type="button"
                        variant={"outline"}
                    >
                        Continue with Google
                    </Button>
                    <p className="text-sm text text-foreground/60">
                        Already have an account?{" "}
                        <Link className="text-blue-600 font-medium underline" to="/login">
                            Log in
                        </Link>
                    </p>
                </div>

            </Form>

        </div>
    )
}
