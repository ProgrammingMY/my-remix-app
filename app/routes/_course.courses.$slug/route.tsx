import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"
import { Outlet, useLoaderData } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";
import CourseSidebar from "~/components/course-sidebar/course-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import * as schema from "~/db/schema.server";
import { and, asc, eq } from "drizzle-orm";
import { isAuthenticated } from "~/utils/auth.server";

export const loader = async ({ params, context, request }: LoaderFunctionArgs) => {
    const { env } = context.cloudflare;

    const { user, headers } = await isAuthenticated(request, env);

    if (!user) {
        return redirect("/login", {
            headers
        })
    };

    const db = drizzle(env.DB_drizzle, { schema });

    const course = await db.query.course.findFirst({
        where: eq(schema.course.slug, params.slug!),
        with: {
            chapters: {
                where: eq(schema.chapter.isPublished, true),
                with: {
                    userProgress: {
                        where: eq(schema.userProgress.userId, user.id),
                    }
                },
                orderBy: [asc(schema.chapter.position)]
            },
        }
    });

    if (!course) {
        return redirect("/user", {
            headers
        })
    };

    const purchase = await db.query.purchase.findFirst({
        where: and(
            eq(schema.purchase.userId, user.id),
            eq(schema.purchase.courseId, course.id)
        )
    });

    return {
        course,
        purchase
    }
}

export default function CourseId() {
    const { course, purchase } = useLoaderData<typeof loader>();
    return (
        <SidebarProvider>
            <CourseSidebar
                course={course}
                purchase={purchase}
            />
            <div className="h-full w-full">
                <SidebarTrigger className="h-10 w-10" />
                <main className="h-full p-6">
                    <Outlet />
                </main>
            </div>
        </SidebarProvider>
    )
}
