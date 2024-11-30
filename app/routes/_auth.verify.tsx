import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Form, Link, useActionData, useFetcher, useLocation, useSearchParams } from "@remix-run/react";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Button } from "~/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "~/components/ui/input-otp";
import { Label } from "~/components/ui/label";
import * as schema from "~/db/schema.server";
import { deleteEmailVerificationCookie, verifyEmailVerificationCookie, verifyTotp } from "~/utils/verify.server";
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import * as z from 'zod'
import { startUserSession, verifyUserEmail } from "~/utils/user.server";

const VerifySchema = z.object({
    code: z.string().length(6),
})

export const action = async ({ request, context }: ActionFunctionArgs) => {
    const { env } = context.cloudflare;

    const db = drizzle(env.DB_drizzle, { schema });

    const headers = new Headers();

    // make sure the user have email verification cookie
    const emailVerificationRequest = await verifyEmailVerificationCookie(request, headers, env);

    if (!emailVerificationRequest) {
        return redirect("/signup", {
            headers
        });
    }

    const code = (await request.formData()).get("code") as string;
    // verify totp
    const { error } = await verifyTotp({
        code,
        verificationId: emailVerificationRequest.id,
        userId: emailVerificationRequest.userId,
        env,
    })

    if (error) {
        return {
            message: error.message,
        }
    }

    const user = await verifyUserEmail({ userId: emailVerificationRequest.userId, db });

    if (!user) {
        return {
            message: "Something went wrong",
        }
    }

    // delete the verification cookie
    await deleteEmailVerificationCookie(request, headers, env);

    // start user session
    await startUserSession({ userId: emailVerificationRequest.userId, db, headers });

    // return to dashboard
    return redirect("/user", {
        headers
    });
}

export default function Verify() {
    const [searchParams] = useSearchParams()
    const [form, fields] = useForm({
        id: 'verify-form',
        constraint: getZodConstraint(VerifySchema),
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: VerifySchema })
        },
        defaultValue: {
            code: searchParams.get("code"),
        },
    });
    const actionData = useActionData<typeof action>();
    const fetcher = useFetcher();

    return (
        <>
            <Link
                to="/signup"
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
            <div className="w-full flex-col flex items-center sm:max-w-md justify-center gap-2 p-4 h-[320px]">
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
                    {actionData && actionData.message && <p className="text-red-600">{actionData.message}</p>}
                    <Button type="submit" disabled={!fields.code}>
                        Verify
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
        </>
    )
}
