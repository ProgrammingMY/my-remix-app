import { useState } from "react";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { updateUsername, updateUserPassword, updateUserPicture } from "~/utils/user.server";
import { parseWithZod } from "@conform-to/zod";
import { isAuthenticated } from "~/utils/auth.server";
import { updateUsernameSchema, updateUserPasswordSchema, updateUserPictureSchema } from "~/lib/schema";

import { drizzle } from "drizzle-orm/d1";
import * as schema from "~/db/schema.server";
import { eq } from "drizzle-orm";

export const action = async ({ request, context }: ActionFunctionArgs) => {
    const { env } = context.cloudflare;

    const { user } = await isAuthenticated(request, env);

    if (!user) {
        throw redirect("/login");
    }

    const formData = await request.clone().formData();
    const intent = formData.get("intent");

    switch (intent) {
        case "updateUsername":
            const submission = parseWithZod(formData, { schema: updateUsernameSchema });
            if (submission.status !== "success") {
                return {
                    result: submission.reply(),
                };
            }
            return updateUsername({ userId: user.id, name: submission.value.name, env });
        // case "updateUserPicture":
        //     const submissionPicture = parseWithZod(formData, { schema: updateUserPictureSchema });
        //     if (submissionPicture.status !== "success") {
        //         return {
        //             result: submissionPicture.reply(),
        //         };
        //     }
        //     return updateUserPicture({ userId: user.id, imageUrl: submissionPicture.value.picture, env });
        case "updateUserPassword":
            return updateUserPassword({ userId: user.id, request, env });
    }
}

// load current user data
export const loader = async ({ request, context }: LoaderFunctionArgs) => {
    const { env } = context.cloudflare;
    const { user } = await isAuthenticated(request, env);

    if (!user) {
        throw redirect("/login");
    }

    // if user login with google, we don't need to check for password
    const db = drizzle(env.DB_drizzle, { schema });
    const userGoogle = await db.query.connection.findFirst({
        where: eq(schema.connection.userId, user.id),
    });

    return {
        user,
        userGoogle,
    };
}

export default function AccountPage() {
    const actionData = useActionData<typeof action>();
    const loaderData = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { user, userGoogle } = loaderData;

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const isSubmitting = navigation.state === "submitting" || navigation.state === "loading";

    if (userGoogle) {
        return (
            <div className="space-y-6 p-4 max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold">Account Settings</h1>
                <p className="text-sm text-gray-500">You are signed in with Google. You cannot change your password or username.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-4 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold">Account Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form method="post" className="space-y-4">
                        <input type="hidden" name="intent" value="updateUsername" />
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" required minLength={2} placeholder={user.name!} />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form method="post" className="space-y-4">
                        <input type="hidden" name="intent" value="updateUserPassword" />
                        <div>
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                required
                                minLength={8}
                            />
                        </div>
                        <div>
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                            />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Password"}
                        </Button>
                    </Form>
                </CardContent>
            </Card>

            {/* <Card>
                <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form method="post" encType="multipart/form-data" className="space-y-4">
                        <input type="hidden" name="intent" value="updatePicture" />
                        <div>
                            <Label htmlFor="picture">Upload Picture</Label>
                            <Input
                                id="picture"
                                name="picture"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                required
                            />
                        </div>
                        {previewUrl && (
                            <div className="mt-2">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-full"
                                />
                            </div>
                        )}
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Uploading..." : "Upload Picture"}
                        </Button>
                    </Form>
                </CardContent>
            </Card> */}
        </div>
    )
}
