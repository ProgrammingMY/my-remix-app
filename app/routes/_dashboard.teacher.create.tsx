import { drizzle } from "drizzle-orm/d1";
import { ActionFunctionArgs, json, redirect } from '@remix-run/cloudflare'
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react'
import { redirectWithError, redirectWithSuccess } from 'remix-toast'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { createSupabaseServerClient } from '~/utils/supabase.server'
import { Course } from "~/db/schema.server";

export const action = async ({ request, context }: ActionFunctionArgs) => {
    try {
        const formData = await request.formData();
        const { env } = context.cloudflare;

        const { supabaseClient, headers } = createSupabaseServerClient(request, env);

        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) {
            return redirect("/login", {
                headers
            });
        }

        const newTitle = formData.get("title") as string;
        const slug = newTitle.toLowerCase().replaceAll(" ", "-");

        const db = drizzle(env.DB_drizzle);

        const course = await db.insert(Course)
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
    return (
        <div className='max-w-5xl mx-auto flex md:items-center md:justify-center h-full'>
            <div>
                <h1 className='text-2xl'>
                    Name Your Course
                </h1>
                <p className='text-sm'>
                    What would you like to name your course? You can change this later.
                </p>
                <Form
                    className='space-y-8 mt-8'
                    method='post'
                >
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
                </Form>
            </div>
        </div >
    )
}
