
import { Category, Course } from '@prisma/client';
import { LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { CoursesList } from '~/components/courses-list';
import { getProgress } from '~/utils/getProgress.server';
import { createPrismaClient } from '~/utils/prisma.server';
import { createSupabaseServerClient } from '~/utils/supabase.server';

type CourseWithProgressWithCategory = Course & {
    category: Category | null;
    chapters: { id: string }[];
    progress: number | null;
};

export const loader = async ({ context, params, request }: LoaderFunctionArgs) => {
    try {
        const { env } = context.cloudflare;
        const { supabaseClient, headers } = createSupabaseServerClient(request, env);

        const {
            data: { user },
        } = await supabaseClient.auth.getUser();

        if (!user) {
            return redirect("/login", {
                headers,
            });
        }

        const db = createPrismaClient(env);
        const courses = await db.course.findMany({
            where: {
                isPublished: true,
            },
            include: {
                category: true,
                chapters: {
                    where: {
                        isPublished: true,
                    },
                    select: {
                        id: true,
                    },
                },
                purchases: {
                    where: {
                        userId: user.id,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const courseWithProgress: CourseWithProgressWithCategory[] =
            await Promise.all(
                courses.map(async (course) => {
                    if (course.purchases.length === 0) {
                        return {
                            ...course,
                            progress: null,
                        };
                    }

                    const coursePercentage = await getProgress(user.id, course.id, env);

                    return {
                        ...course,
                        progress: coursePercentage,
                    };
                })
            );

        return courseWithProgress;
    } catch (error) {
        console.log("[GET_COURSES]", error);
        return [];
    }
}

const Search = () => {
    const courses = useLoaderData<typeof loader>();

    return (
        <>
            <div className='space-y-4'>
                <CoursesList
                    items={courses}
                />
            </div>
        </>
    )
}

export default Search