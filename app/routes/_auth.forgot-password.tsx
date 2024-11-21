import { ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { Form, Link, useActionData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import * as schema from "~/db/schema.server";
import { startTOTPProcess } from "~/utils/auth.server";

export const action = async ({ request, context }: ActionFunctionArgs) => {
    const { env } = context.cloudflare;

    try {
        const formData = await request.formData();
        const email = formData.get("email");

        if (!email) {
            return json({ error: { message: "Email is required" } }, { status: 400 });
        }

        if (typeof email !== "string") {
            return json({ error: { message: "Email must be a string" } }, { status: 400 });
        }

        const db = drizzle(env.DB_drizzle, { schema });

        const user = await db.query.user.findFirst({
            where: eq(schema.user.email, email),
            columns: {
                id: true,
                email: true,
            }
        });

        if (!user) {
            return json({ error: { message: "User not found" } }, { status: 400 });
        }

        const headers = new Headers();

        // create totp
        await startTOTPProcess(request, headers, user.id, user.email, db);

        // redirect to reset password page
        return redirect("/reset-password", {
            headers
        });
    } catch (error) {
        return json({ error: { message: "Something went wrong" } }, { status: 400 });
    }



}

export default function ForgotPassword() {
    const data = useActionData<typeof action>();
    const { error } = data ?? {};
    return (
        <div className="grid gap-y-2">
            <h1 className="text-3xl font-bold">Forgot Password</h1>
            <p className="mt-3 text-body-md text-muted-foreground">We will send you a code to reset your password</p>
            <Form method="POST">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="your email"
                            required
                        />
                    </div>
                    {error ? <p className="text-red-600">{error.message}</p> : null}
                    <Button type="submit" className="w-full">
                        Submit
                    </Button>
                </div>
            </Form>
            <Link
                to="/login"
                className="mt-11 text-center text-sm text-muted-foreground"
            >
                Back to Login
            </Link>
        </div>
    )
}
