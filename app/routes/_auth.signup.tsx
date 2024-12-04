import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, Link, redirect, useActionData, useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'

import { isAuthenticated, signup } from "~/utils/auth.server"
import { signupSchema } from "~/lib/schema";

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

    return await signup(request, env);
}
// First we create our UI with the form doing a POST and the inputs with the
// names we are going to use in the strategy
export default function Screen() {
    const actionData = useActionData<typeof action>();
    const navigate = useNavigate();

    const [form, fields] = useForm({
        id: "signup-form",
        constraint: getZodConstraint(signupSchema),
        lastResult: actionData?.result,
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: signupSchema });
        },
        shouldValidate: "onBlur",
    });

    return (
        <div className="flex flex-col justify-center py-8">
            <Link
                to="/"
                className="py-2 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
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

            <Form method="POST" {...getFormProps(form)}>
                <div className="flex flex-col gap-y-4 mt-8">
                    <div className="grid gap-2">
                        <Label htmlFor={fields.email.id}>
                            Email
                        </Label>
                        <Input
                            {...getInputProps(fields.email, { type: "email" })}
                            placeholder="Enter your email"
                            autoFocus
                            autoComplete="email"
                        />
                        {fields.email.errors && (
                            <p className="text-red-600 text-sm">{fields.email.errors[0]}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={fields.name.id}>Name</Label>
                        <Input
                            {...getInputProps(fields.name, { type: "text" })}
                            placeholder="Enter your name"
                        />
                        {fields.name.errors && (
                            <p className="text-red-600 text-sm">{fields.name.errors[0]}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={fields.password.id}>Password</Label>
                        <Input
                            {...getInputProps(fields.password, { type: "password" })}
                            placeholder="Enter your password"
                        />
                        {fields.password.errors && (
                            <p className="text-red-600 text-sm">{fields.password.errors[0]}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={fields.retypePassword.id}>Retype Password</Label>
                        <Input
                            {...getInputProps(fields.retypePassword, { type: "password" })}
                            placeholder="Retype your password"
                        />
                        {fields.retypePassword.errors && (
                            <p className="text-red-600 text-sm">{fields.retypePassword.errors[0]}</p>
                        )}
                    </div>
                    {form.errors && (
                        <p className="text-red-600 text-sm">{form.errors[0]}</p>
                    )}
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
                        onClick={() => navigate("/api/login/google")}
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
