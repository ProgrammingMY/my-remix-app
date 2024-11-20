
// loader get the code from the url
// 
// loader verify code, if valid render form to set new password
// action set the new password

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, Link, useActionData, useLoaderData, useSearchParams } from "@remix-run/react";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Button } from "~/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "~/components/ui/input-otp";
import { Label } from "~/components/ui/label";
import * as schema from "~/db/schema.server";
import * as z from 'zod'
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { deleteEmailVerificationCookie, verifyEmailVerificationCookie, verifyTotp } from "~/utils/verify.server";
import { drizzle } from "drizzle-orm/d1";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { Input } from "~/components/ui/input";
import { startUserSession } from "~/utils/user.server";


const VerifySchema = z.object({
    code: z.string().length(6),
    password: z.string().optional(),
})

export const action = async ({ request, context }: ActionFunctionArgs) => {
    const { env } = context.cloudflare;

    const db = drizzle(env.DB_drizzle, { schema });

    const headers = new Headers();
    const requestUrl = new URL(request.url);

    // if user send code, verify it
    const formData = await request.formData();
    const password = formData.get("password");

    const code = requestUrl.searchParams.get("code") ?? formData.get("code");
    if (!code) {
        return null;
    }

    if (code && typeof code === "string" && !password) {
        return redirect(`/reset-password?code=${code}`, {
            headers
        });
    }

    if (code && typeof code === "string" && password && typeof password === "string") {
        // make sure the user have email verification cookie
        const emailVerificationRequest = await verifyEmailVerificationCookie(request, headers, db);


        if (!emailVerificationRequest) {
            return redirect("/signup", {
                headers
            });
        }

        // verify totp
        const { error } = await verifyTotp({
            code,
            verificationId: emailVerificationRequest.id,
            userId: emailVerificationRequest.userId,
            db,
        });

        if (error) {
            return {
                message: error.message,
            }
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await db.update(schema.user).set({
            hashedPassword,
        }).where(eq(schema.user.id, emailVerificationRequest.userId)).returning({ id: schema.user.id });

        if (!user) {
            return {
                message: "Something went wrong",
            }
        }



        // invalidate the email verification cookie
        await deleteEmailVerificationCookie(request, headers, db);

        // assign the user to the session
        await startUserSession({ userId: user[0].id, db, headers });

        // redirect to the home page
        return redirect("/user", {
            headers
        })
    }

    return {
        message: "Something went wrong",
    }
}

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    if (!code) {
        return null;
    }

    const { env } = context.cloudflare;

    const db = drizzle(env.DB_drizzle, { schema });

    const headers = new Headers();

    // make sure the user have email verification cookie
    const emailVerificationRequest = await verifyEmailVerificationCookie(request, headers, db);

    if (!emailVerificationRequest) {
        return redirect("/signup", {
            headers
        });
    }

    // verify totp
    const { error } = await verifyTotp({
        code,
        verificationId: emailVerificationRequest.id,
        userId: emailVerificationRequest.userId,
        db,
    });

    if (error) {
        return {
            message: error.message,
        }
    }

    return {
        message: "ok",
    }
}


export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const [form, fields] = useForm({
        id: 'verify-form',
        constraint: getZodConstraint(VerifySchema),
        // onValidate({ formData }) {
        //     return parseWithZod(formData, { schema: VerifySchema })
        // },
        defaultValue: {
            code: searchParams.get("code"),
            password: '',
        },
        shouldValidate: 'onBlur',
    });
    const actionData = useActionData<typeof action>();
    const loaderData = useLoaderData<typeof loader>();


    return (
        <div className="w-full flex-col flex items-center sm:max-w-md justify-center gap-2 p-4 h-[320px]">
            <Link
                to="/login"
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
            <Form method="post" {...getFormProps(form)} className="flex justify-center items-center flex-col gap-y-6">
                <Label>
                    Enter verify code
                </Label>
                <InputOTP
                    {...getInputProps(fields["code"], { type: "text" })}
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                    autoComplete="one-time-code"
                    autoFocus
                    disabled={loaderData?.message === "ok"}
                >
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
                {loaderData?.message === "ok" && (
                    <>
                        <Label>
                            Enter new password
                        </Label>
                        <Input {...getInputProps(fields["password"], { type: "password" })} />
                        {loaderData && loaderData.message && <p className="text-red-600">{loaderData.message}</p>}
                    </>
                )}

                <Button type="submit">
                    Submit
                </Button>
            </Form>
            <div className="text-center mt-16">
                <div className="mt-4 text-sm">
                    Not received the code?{" "}
                    {/* <Button type="button" variant={"link"} onClick={() => fetcher.load("/api/request-code")}>
                        Request another code
                    </Button> */}
                </div>
            </div>
        </div>
    )
}
