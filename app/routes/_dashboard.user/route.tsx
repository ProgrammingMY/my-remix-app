import { CoursesList } from "~/components/courses-list";
import { CheckCircle, Clock } from "lucide-react";
import { InfoCard } from "./info-card";
import { defer, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "~/db/schema.server";
import { eq } from "drizzle-orm";
import { CategoryType, ChapterType, CourseType } from "~/db/schema.server";
import { getProgress } from "~/utils/getProgress.server";
import { isAuthenticated } from "~/utils/auth.server";
import { capitalizeFirstLetter } from "~/lib/format";

type CourseWithProgressWithCategory = CourseType & {
    category: CategoryType;
    chapters: ChapterType[];
    progress: number | null;
};

export const loader = async ({ request, context, params }: LoaderFunctionArgs) => {
    try {
        const { env } = context.cloudflare;

        const { user, headers } = await isAuthenticated(request, env);

        if (!user) {
            return redirect("/login", {
                headers,
            });
        }

        const db = drizzle(env.DB_drizzle, { schema });

        const purchasedCourses = await db.query.purchase.findMany({
            where: eq(schema.purchase.userId, user.id),
            with: {
                course: {
                    with: {
                        chapters: {
                            where: eq(schema.chapter.isPublished, true),
                        }
                    }
                }
            }
        })

        const courses = purchasedCourses.map(
            (purchase) => purchase.course
        ) as CourseWithProgressWithCategory[];

        // get progress
        for (let course of courses) {
            const progress = await getProgress(user.id, course.id, env);
            course["progress"] = progress;
        }

        const completedCourses = courses.filter(
            (course) => course.progress === 100
        );
        const coursesInProgress = courses.filter(
            (course) => (course.progress ?? 0) < 100
        );

        return {
            user,
            completedCourses,
            coursesInProgress,
        };
    } catch (error) {
        console.log("[DASHBOARD COURSES]", error);
        return {
            user: null,
            completedCourses: [],
            coursesInProgress: [],
        };
    }
}

const UserDashboard = () => {
    const { user, completedCourses, coursesInProgress } = useLoaderData<typeof loader>();

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-3xl font-bold">
                Welcome, <span>{capitalizeFirstLetter(user?.name ?? "")}</span>
            </h1>
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
            <h2 className="text-md text-muted-foreground mt-4">
                Continue watching
            </h2>
            <CoursesList
                items={[...coursesInProgress, ...completedCourses]}
            />
        </div>
    )
}

export default UserDashboard