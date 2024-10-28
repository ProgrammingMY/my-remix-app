import { LoaderFunctionArgs, redirect } from '@remix-run/cloudflare'
import { Link, useLoaderData } from '@remix-run/react'
import { PlusCircle } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { createSupabaseServerClient } from '~/utils/supabase.server'
import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";


export const loader = async ({ context, params, request }: LoaderFunctionArgs) => {
    const { env } = context.cloudflare
    const { supabaseClient, headers } = createSupabaseServerClient(request, env);

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        return redirect("/login", {
            headers
        });
    }

    const adapter = new PrismaD1(env.DB);
    const prisma = new PrismaClient({ adapter });

    const courses = await prisma.course.findMany({
        where: {
            userId: user.id,
        }
    })

    return { courses }
}

export default function TeacherCourses() {
    const { courses } = useLoaderData<typeof loader>();
    return (
        <>
            <Link to='/teacher/create'>
                <Button className='flex items-center justify-center'>
                    <PlusCircle className='h-4 w-4 mr-2' />
                    New course
                </Button>
            </Link>
            <div className='flex flex-col gap-4 mt-4'>
                {courses.map(course => (
                    <Link to={`/teacher/courses/${course.slug}`}>
                        <Button variant={'ghost'} className='flex items-center justify-center'>
                            {course.title}
                        </Button>
                    </Link>
                ))}
            </div>
        </>
    )
}
