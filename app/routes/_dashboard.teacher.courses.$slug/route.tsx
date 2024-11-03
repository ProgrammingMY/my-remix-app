import { IconBadge } from "~/components/icon-badge";
import TitleForm from "./title-form";
import { CircleDollarSign, File, LayoutDashboard, ListCheck } from "lucide-react";
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { createSupabaseServerClient } from "~/utils/supabase.server";
import { useLoaderData } from "@remix-run/react";
import { DescriptionForm } from "./description-form";
import { PriceForm } from "./price-form";
import { ImageForm } from "./image-form";
import { AttachmentForm } from "./attachment-form";
import { ChaptersForm } from "./chapters-form";
import { jsonWithError, jsonWithSuccess, redirectWithSuccess } from "remix-toast";
import Mux from "@mux/mux-node";
import Action from "./action";
import { drizzle } from "drizzle-orm/d1";
import { Course, Attachment, Chapter, MuxData, CourseType, ChapterType, AttachmentType } from "~/db/schema.server";
import { and, asc, desc, eq } from "drizzle-orm";

interface CourseFormLoaderData {
    course: CourseType;
    chapters: ChapterType[];
    attachments: AttachmentType[];
    isComplete: boolean;
    completionText: string;
}

export const action = async ({
    context,
    request,
    params,
}: ActionFunctionArgs) => {
    try {
        const { env } = context.cloudflare;

        const { supabaseClient, headers } = createSupabaseServerClient(
            request,
            env
        );

        const {
            data: { user },
        } = await supabaseClient.auth.getUser();

        if (!user) {
            return redirect("/login", {
                headers,
            });
        }

        const db = drizzle(env.DB_drizzle, { schema: { Course, Attachment, Chapter, MuxData } });

        // DELETE METHOD
        if (request.method === "DELETE") {
            const course = await db.query.Course.findFirst({
                where: and(
                    eq(Course.slug, params.slug!),
                    eq(Course.userId, user.id)
                ),
            })

            if (!course) {
                return jsonWithError("Error", "Course not found");
            }

            const chapters = await db.query.Chapter.findMany({
                where: eq(Chapter.courseId, course.id),
                orderBy: [asc(Chapter.position)],
            })



            const mux = new Mux({
                tokenId: env.MUX_TOKEN_ID,
                tokenSecret: env.MUX_TOKEN_SECRET,
            });

            if (!mux) {
                throw new Error("Mux is not configured");
            }

            for (const chapter of chapters) {
                const muxData = await db.query.MuxData.findFirst({
                    where: and(
                        eq(MuxData.chapterId, chapter.id),
                    )
                })
                if (muxData?.assetId) {
                    await mux.video.assets.delete(muxData.assetId);
                }
            }

            await db.delete(Course).where(eq(Course.slug, course.slug));

            return redirectWithSuccess("/teacher/courses", "Course deleted successfully");
        }

        // PATCH METHOD
        else if (request.method === "PATCH") {
            const values = await request.json() as CourseType;

            console.log(values);

            await db.update(Course)
                .set({ ...values })
                .where(and(
                    eq(Course.slug, params.slug!),
                    eq(Course.userId, user.id)
                ))

            return jsonWithSuccess(
                { result: "Course updated successfully." },
                {
                    message: "Success",
                }
            );
        }

    } catch (error) {
        console.log("[UPDATE COURSE] ERROR", error);
        return jsonWithError(
            { result: "Something went wrong." },
            { message: "Error" }
        );
    }
};

export const loader = async ({ context, params, request }: LoaderFunctionArgs) => {
    const { env } = context.cloudflare;
    const { supabaseClient, headers } = createSupabaseServerClient(request, env);

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        return redirect("/login", {
            headers
        });
    };

    const db = drizzle(env.DB_drizzle, {
        schema: { Course, Attachment, Chapter },
    });

    const course = await db.query.Course.findFirst({
        where: and(
            eq(Course.slug, params.slug!),
            eq(Course.userId, user.id),
        ),
    })

    if (!course) {
        return redirect("/teacher/courses", {
            headers
        });
    }

    const chapters = await db.query.Chapter.findMany({
        where: eq(Chapter.courseId, course.id),
        orderBy: [asc(Chapter.position)],
    })

    const attachments = await db.query.Attachment.findMany({
        where: eq(Attachment.courseId, course.id),
        orderBy: [desc(Attachment.createdAt)],
    })



    const requiredField = [
        course.title,
        course.description,
        course.imageUrl,
        course.price,
        // course.categoryId,
        chapters.some(chapter => chapter.isPublished)
    ];

    const totalField = requiredField.length;
    const completedField = requiredField.filter(Boolean).length;

    const completionText = `(${completedField}/${totalField})`;

    const isComplete = requiredField.every(Boolean);

    return json({
        course,
        chapters,
        attachments,
        isComplete,
        completionText,
    })
}

export default function CourseForm() {
    const data = useLoaderData<typeof loader>();
    const course = JSON.parse(JSON.stringify(data.course)) as CourseType;
    const chapters = JSON.parse(JSON.stringify(data.chapters)) as ChapterType[];
    const attachments = JSON.parse(JSON.stringify(data.attachments)) as AttachmentType[];
    const isComplete = data.isComplete;
    const completionText = data.completionText;

    return (
        <div>
            <div className='flex items-center justify-between'>
                <div className='flex flex-col gap-y-2'>
                    <h1 className='text-2xl font-medium'>Course setup</h1>
                    <span className='text-sm text-foreground/60'>
                        Complete all fields {completionText}
                    </span>
                </div>
                {/* <Action
                    disabled={!isComplete}
                    courseSlug={course.slug}
                    isPublished={course.isPublished === 1}
                /> */}

            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
                <div className="space-y-6">
                    <div className='flex items-center gap-x-2'>
                        <IconBadge icon={LayoutDashboard} />
                        <h2 className='text-xl'>Customize your course</h2>

                    </div>
                    <TitleForm
                        initialData={course}
                        courseSlug={course.slug}
                    />
                    <DescriptionForm
                        initialData={course}
                        courseSlug={course.slug}
                    />
                    <ImageForm
                        initialData={course}
                        courseSlug={course.slug}
                    />
                    {/* <CategoryForm
                        initialData={course}
                        courseId={course.id}
                        options={categories.map((category) => ({
                            label: category.name,
                            value: category.id,
                        }))}
                    /> */}
                </div>
                <div className='space-y-6'>
                    <div>
                        <div className='flex items-center gap-x-2'>
                            <IconBadge icon={ListCheck} />
                            <h2 className='text-xl'>
                                Course chapters
                            </h2>
                        </div>
                        <ChaptersForm
                            initialData={chapters}
                            courseSlug={course.slug}
                        />
                    </div>

                    <div className="space-y-6">
                        <div className='flex items-center gap-x-2'>
                            <IconBadge icon={CircleDollarSign} />
                            <h2 className='text-xl'>
                                Sell your course
                            </h2>
                        </div>
                        <PriceForm initialData={course} courseSlug={course.slug} />
                    </div>
                    <div>
                        <div className='flex items-center gap-x-2'>
                            <IconBadge icon={File} />
                            <h2 className='text-xl'>
                                Resources & Attachments
                            </h2>
                        </div>
                        <AttachmentForm
                            initialData={attachments}
                            courseSlug={course.slug}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
