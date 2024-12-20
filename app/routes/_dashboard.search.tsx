
import { LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { CoursesList } from '~/components/courses-list';
import { CategoryType, CourseType } from '~/db/schema.server';
import { getProgress } from '~/utils/getProgress.server';
import * as schema from '~/db/schema.server';
import { and, desc, eq, like } from 'drizzle-orm';
import { isAuthenticated } from '~/utils/auth.server';
import { SearchInput } from '~/components/search-input';

type CourseWithProgressWithCategory = CourseType & {
    category: CategoryType | null;
    chapters: { id: string }[];
    progress: number | null;
};

export const loader = async ({ context, params, request }: LoaderFunctionArgs) => {
    try {
        const { env } = context.cloudflare;

        const url = new URL(request.url);
        const title = url.searchParams.get('title');

        const { user, headers } = await isAuthenticated(request, env);

        if (!user) {
            return redirect("/login", {
                headers,
            });
        }

        const db = drizzle(env.DB_drizzle, { schema });

        const courses = await db.query.course.findMany({
            where: and(
                eq(schema.course.isPublished, true),
                title ? like(schema.course.title, `%${title}%`) : undefined
            ),
            with: {
                category: true,
                chapters: {
                    where: eq(schema.chapter.isPublished, true),
                    columns: {
                        id: true
                    }
                },
                purchases: {
                    where: eq(schema.purchase.userId, user.id),
                }
            },
            orderBy: [desc(schema.course.createdAt)]
        })

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
            <div className='p-6 space-y-4'>
                <SearchInput />
                <CoursesList
                    items={courses}
                />
            </div>
        </>
    )
}

export default Search