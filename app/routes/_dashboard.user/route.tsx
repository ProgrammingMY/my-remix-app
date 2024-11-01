import { CoursesList } from "~/components/courses-list";
import { CheckCircle, Clock } from "lucide-react";
import { InfoCard } from "./info-card";
import { defer, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { createSupabaseServerClient } from "~/utils/supabase.server";
import { createPrismaClient } from "~/utils/prisma.server";
import { Category, Chapter, Course } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

type CourseWithProgressWithCategory = Course & {
    category: Category;
    chapters: Chapter[];
    progress: number | null;
};

export const loader = async ({ request, context, params }: LoaderFunctionArgs) => {
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
        const purchaseCourses = await db.purchase.findMany({
            where: {
                userId: user.id,
            },
            select: {
                course: {
                    include: {
                        category: true,
                        chapters: {
                            where: {
                                isPublished: true,
                            },
                        },
                    },
                },
            },
        });

        const courses = purchaseCourses.map(
            (purchase) => purchase.course
        ) as CourseWithProgressWithCategory[];

        // get progress
        for (let course of courses) {
            try {
                const publisedChapters = await db.chapter.findMany({
                    where: {
                        courseId: course.id,
                        isPublished: true,
                    },
                    select: {
                        id: true
                    }
                });

                const publishedChapterIds = publisedChapters.map((chapter) => chapter.id);

                const validCompletedChapters = await db.userProgress.count({
                    where: {
                        userId: user.id,
                        chapterId: {
                            in: publishedChapterIds,
                        },
                        isCompleted: true
                    }
                });

                const progressPercentage = (validCompletedChapters / publishedChapterIds.length) * 100;

                course["progress"] = progressPercentage;

            } catch (error) {
                console.log("[GET_PROGRESS]", error);
                course["progress"] = 0;
            }

        }

        const completedCourses = courses.filter(
            (course) => course.progress === 100
        );
        const coursesInProgress = courses.filter(
            (course) => (course.progress ?? 0) < 100
        );

        return defer({
            completedCourses,
            coursesInProgress,
        });
    } catch (error) {
        console.log("[DASHBOARD COURSES]", error);
        return {
            completedCourses: [],
            coursesInProgress: [],
        };
    }
}

const UserDashboard = () => {
    const { completedCourses, coursesInProgress } = useLoaderData<typeof loader>();

    return (
        <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard
                    icon={Clock}
                    label="Courses in progress"
                    numberOfItems={coursesInProgress.length}
                    variant="default"
                />
                <InfoCard
                    icon={CheckCircle}
                    label="Courses completed"
                    numberOfItems={completedCourses.length}
                    variant="success"
                />
            </div>
            <CoursesList
                items={[...coursesInProgress, ...completedCourses]}
            />
        </div>
    )
}

export default UserDashboard