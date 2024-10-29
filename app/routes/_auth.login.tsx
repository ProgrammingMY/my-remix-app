import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react'
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { createSupabaseServerClient } from '~/utils/supabase.server';

export const action = async ({ context, request }: ActionFunctionArgs) => {
    const { env } = context.cloudflare;
    const { supabaseClient, headers } = createSupabaseServerClient(request, env);

    const formData = await request.formData();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return json({ success: false, message: "Email or password is required" })
    }

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        return json({ success: false, message: "Invalid email or password" })
    }

    return redirect("/user", {
        headers
    });
};


export default function LoginPage() {
    const actionResponse = useActionData<typeof action>()

    return (
        <Form method="post" className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground [&>input]:mb-6 max-w-md p-4 mt-8">
            <h1 className="text-2xl font-medium">Log in</h1>
            <p className="text-sm text-foreground/60">
                Don't have an account?{" "}
                <Link className="text-blue-600 font-medium underline" to={"/register"}>
                    Sign up
                </Link>
            </p>
            <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
                <Label htmlFor="email">Email</Label>
                <Input name="email" placeholder="you@example.com" required />
                <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>

                    <Link
                        className="text-sm text-blue-600 underline"
                        to="/forgot-password"
                    >
                        Forgot Password?
                    </Link>
                </div>
                <Input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                />
                <Button type="submit" variant={"default"} >
                    Log in
                </Button>
                {actionResponse ? actionResponse.success ? null : <p className="text-red-600">{actionResponse.message}</p> : null}
            </div>
        </Form>
    )
}
