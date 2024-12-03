import { drizzle } from "drizzle-orm/d1";
import { ActionFunctionArgs, redirect } from '@remix-run/cloudflare'
import { Form, Link, useNavigation, useOutletContext } from '@remix-run/react'
import { redirectWithError, redirectWithSuccess } from 'remix-toast'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import * as schema from "~/db/schema.server";
import { Loader2 } from "lucide-react";
import { isAuthenticated } from "~/utils/auth.server";
import { SafeUserType } from "~/lib/types";
import { isTeacher } from "~/lib/isTeacher";
import { Card } from "~/components/ui/card";

export const action = async ({ request, context }: ActionFunctionArgs) => {
    try {
        const formData = await request.formData();

        const { env } = context.cloudflare;

        const { user, headers } = await isAuthenticated(request, env) as { user: SafeUserType, headers: Headers };

        if (!user) {
            return redirect("/login", {
                headers,
            });
        };

        if (!isTeacher(user)) {
            return redirect("/user", {
                headers,
            })
        }

        const newTitle = formData.get("title") as string;
        const slug = newTitle.toLowerCase().replaceAll(" ", "-");

        const db = drizzle(env.DB_drizzle, { schema });

        const course = await db.insert(schema.course)
            .values({
                userId: user.id,
                title: formData.get("title") as string,
                slug: slug,
            })
            .returning();


        return redirectWithSuccess(`/teacher/courses/${course[0].slug}`, "Course created successfully");

    } catch (error) {
        return redirectWithError("/teacher/courses", "Something went wrong");
    }

}

export default function CreatePage() {
    const navigation = useNavigation();
    const isSubmitting = navigation.formAction === "/teacher/create";
    return (
        <div className='relative md:min-h-[80svh] max-w-5xl mx-auto flex items-center justify-center '>
            <Card className="p-6 space-y-4 h-30">
                <h1 className='text-2xl'>
                    Name Your Course
                </h1>
                <p className='text-sm'>
                    What would you like to name your course? You can change this later.
                </p>
                <Form
                    className='mt-8'
                    method='post'
                    action="/teacher/create"
                >
                    <fieldset disabled={isSubmitting} className="space-y-6" >
                        <Label>Course Title</Label>
                        <Input placeholder="Title" name='title' />
                        <div className='flex items-center gap-x-2'>
                            <Link to="/teacher/courses">
                                <Button variant='ghost' type='button' className='text-sm'>
                                    Cancel
                                </Button>
                            </Link>
                            <Button type='submit'>
                                Create Course
                            </Button>
                        </div>
                    </fieldset>
                </Form>

            </Card>
            {isSubmitting ? (
                <div className='absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-m flex items-center justify-center'>
                    <Loader2 className='h-10 w-10 animate-spin text-sky-700' />
                </div>
            ) : null}
        </div >
    )
}
