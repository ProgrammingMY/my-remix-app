import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "~/db/schema.server";

export const loader = async ({ params, context, request }: LoaderFunctionArgs) => {
    const { env } = context.cloudflare;

    const db = drizzle(env.DB_drizzle, { schema });

    const course = await db.query.course.findFirst({
        where: eq(schema.course.slug, params.slug!),
        with: {
            chapters: {
                where: eq(schema.chapter.isPublished, true),
                orderBy: [asc(schema.chapter.position)]
            },
        }
    });

    if (!course) {
        return redirect("/user")
    };

    return redirect(`/courses/${course.slug}/chapters/${course.chapters[0].id}`);
}

export default function CoursePage() {
    return (
        <div>CoursePage</div>
    )
}
