import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { createSupabaseServerClient } from '~/utils/supabase.server';

export const action = async ({ context, request }: ActionFunctionArgs) => {
    const { env } = context.cloudflare;
    const { supabaseClient, headers } = createSupabaseServerClient(request, env);

    const formData = await request.formData();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return redirect("/login");
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        return json({ success: false }, { headers })
    }

    return redirect("/dashboard", {
        headers
    });
};


export default function LoginPage() {
    const actionResponse = useActionData<typeof action>()

    return (
        <Form method="post">
            {actionResponse?.success ? <div>Login Success</div> : <div>Login Failed</div>}
            <div>
                <label htmlFor="email">Email</label>
                <input type="email" name="email" id="email" />
            </div>

            <div>
                <label htmlFor="password">Password</label>
                <input type="password" name="password" id="password" />
            </div>

            <button>Log In</button>
        </Form>
    )
}
