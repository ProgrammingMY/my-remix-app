import { ActionFunction, ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, redirect, useActionData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import { isAuthenticated, signup } from "~/utils/auth.server"

export async function loader({ request, context }: LoaderFunctionArgs) {
    const { env } = context.cloudflare;

    return await isAuthenticated(request, env, {
        successRedirect: "/dashboard",
    });
};

export const action = async ({ request, context }: ActionFunctionArgs) => {

    const { env } = context.cloudflare;
    // const form = await request.clone().formData();

    // const email = form.get("email") as string;
    // const password = form.get("password") as string;
    // const name = form.get("name") as string;

    // if (typeof email !== "string" || typeof password !== "string" || typeof name !== "string") {
    //     return json({ error: `Invalid Form Data`, form: action }, { status: 400 });
    // }

    // if (!email.includes("@")) {
    //     return json({ error: `Invalid Form Data`, form: action }, { status: 400 });
    // }

    // if (!password.length) {
    //     return json({ error: `Invalid Form Data`, form: action }, { status: 400 });
    // }

    // if (!name.length) {
    //     return json({ error: `Invalid Form Data`, form: action }, { status: 400 });
    // }

    const { error, headers } = await signup(request, env);

    if (!error) {
        return redirect("/dashboard", {
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
        <div className="container flex flex-col justify-center pb-32 pt-20">
            <div className="text-center">
                <h1 className="text-h1">Let's start your journey!</h1>
                <p className="mt-3 text-body-md text-muted-foreground">
                    Please enter your email.
                </p>
            </div>
            <div className="mx-auto mt-16 min-w-full max-w-sm sm:min-w-[368px]">

                <Form method="POST">
                    <div>
                        <label htmlFor="email" className="sr-only">
                            Email
                        </label>
                        <Input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="name" className="sr-only">
                            Name
                        </label>
                        <Input
                            type="text"
                            name="name"
                            id="name"
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">
                            Password
                        </label>
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
                        Submit
                    </Button>
                </Form>
            </div>
        </div>
    )
}
