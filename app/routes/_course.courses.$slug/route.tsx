import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"
import { Outlet, useLoaderData } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";
import CourseSidebar from "~/components/course-sidebar/course-sidebar";
import { AppSidebar } from "~/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { createSupabaseServerClient } from "~/utils/supabase.server";
import * as schema from "~/db/schema.server";
import { and, asc, eq } from "drizzle-orm";

export const loader = async ({ params, context, request }: LoaderFunctionArgs) => {
    const { env } = context.cloudflare;

    const { supabaseClient, headers } = createSupabaseServerClient(request, env);

    const { data: { user } } = await supabaseClient.auth.getUser();

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

    // redirect(`/courses/${course.slug}/chapters/${course.chapters[0].id}`);

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
            <SidebarTrigger className="h-10 w-10" />
            <SidebarInset>
            <div className="h-full w-full">
                <main className="h-full p-6">
                    <Outlet />
                </main>
            </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
