import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"
import { Outlet, useLoaderData } from "@remix-run/react";
import CourseSidebar from "~/components/course-sidebar/course-sidebar";
import { AppSidebar } from "~/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { createPrismaClient } from "~/utils/prisma.server";
import { createSupabaseServerClient } from "~/utils/supabase.server";

export const loader = async ({ params, context, request }: LoaderFunctionArgs) => {
    const { env } = context.cloudflare;

    const { supabaseClient, headers } = createSupabaseServerClient(request, env);

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        return redirect("/login", {
            headers
        })
    };

    const db = createPrismaClient(env);

    const course = await db.course.findUnique({
        where: {
            slug: params.slug,
        },
        include: {
            chapters: {
                where: {
                    isPublished: true,
                },
                include: {
                    userProgress: {
                        where: {
                            userId: user.id,
                        }
                    }
                },
                orderBy: {
                    position: "asc",
                }
            },
        },
    });

    if (!course) {
        return redirect("/courses", {
            headers
        })
    };

    const purchase = await db.purchase.findUnique({
        where: {
            userId_courseId: {
                userId: user.id,
                courseId: course.id,
            }
        }
    });

    redirect(`/courses/${course.slug}/chapters/${course.chapters[0].id}`);

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
            {/* <SidebarInset> */}
            <div className="h-full w-full">
                <main className="h-full p-6">
                    <Outlet />
                </main>
            </div>
            {/* </SidebarInset> */}
        </SidebarProvider>
    )
}
