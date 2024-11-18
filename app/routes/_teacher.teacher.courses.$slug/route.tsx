import { IconBadge } from "~/components/icon-badge";
import TitleForm from "./title-form";
import { CircleDollarSign, File, LayoutDashboard, ListCheck } from "lucide-react";
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { DescriptionForm } from "./description-form";
import { PriceForm } from "./price-form";
import { ImageForm } from "./image-form";
import { AttachmentForm } from "./attachment-form";
import { ChaptersForm } from "./chapters-form";
import { jsonWithError, jsonWithSuccess, redirectWithSuccess } from "remix-toast";
import Action from "./action";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "~/db/schema.server";
import { and, asc, desc, eq } from "drizzle-orm";
import { isAuthenticated } from "~/utils/auth.server";
import { deleteVideo } from "~/utils/bunny.server";
import { isTeacher } from "~/lib/isTeacher";
import { SafeUserType } from "~/lib/types";


export const action = async ({
    context,
    request,
    params,
}: ActionFunctionArgs) => {
    try {
        const { env } = context.cloudflare;

        const { user, headers } = await isAuthenticated(request, env) as { user: SafeUserType, headers: Headers };

        if (!user) {
            return redirect("/login", {
                headers,
            });
        }

        if (!isTeacher(user)) {
            return redirect("/user", {
                headers,
            });
        }

        const db = drizzle(env.DB_drizzle, { schema });

        // DELETE METHOD
        if (request.method === "DELETE") {
            const course = await db.query.course.findFirst({
                where: and(
                    eq(schema.course.slug, params.slug!),
                    eq(schema.course.userId, user.id)
                ),
                with: {
                    chapters: true
                }
            })

            if (!course) {
                return jsonWithError("Error", "Course not found");
            }

            for (const chapter of course.chapters) {
                const bunnyData = await db.query.bunnyData.findFirst({
                    where: and(
                        eq(schema.bunnyData.chapterId, chapter.id),
                    )
                })
                if (bunnyData) {
                    await deleteVideo(bunnyData.videoId, bunnyData.libraryId, env);
                }
            }

            await db.delete(schema.course).where(eq(schema.course.slug, course.slug));

            return redirectWithSuccess("/teacher/courses", "Course deleted successfully");
        }

        // PATCH METHOD
        else if (request.method === "PATCH") {
            const data = await request.formData();
            const values = JSON.parse(JSON.stringify(Object.fromEntries(data)));

            if (values.price) {
                values.price = parseFloat(values.price);
            }

            await db.update(schema.course)
                .set({ ...values })
                .where(and(
                    eq(schema.course.slug, params.slug!),
                    eq(schema.course.userId, user.id)
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
    const { user, headers } = await isAuthenticated(request, env);

    if (!user) {
        return redirect("/login", {
            headers
        });
    };

    const db = drizzle(env.DB_drizzle, {
        schema,
    });

    const course = await db.query.course.findFirst({
        where: and(
            eq(schema.course.slug, params.slug!),
            eq(schema.course.userId, user.id)
        ),
        with: {
            chapters: {
                orderBy: [asc(schema.chapter.position)]
            },
            attachments: {
                orderBy: [desc(schema.attachment.createdAt)]
            }
        }
    })

    if (!course) {
        return redirect("/teacher/courses", {
            headers
        });
    }

    const requiredField = [
        course.title,
        course.description,
        course.imageUrl,
        course.price,
        // course.categoryId,
        course.chapters.some(chapter => chapter.isPublished)
    ];

    const totalField = requiredField.length;
    const completedField = requiredField.filter(Boolean).length;

    const completionText = `(${completedField}/${totalField})`;

    const isComplete = requiredField.every(Boolean);

    return {
        course,
        isComplete,
        completionText,
    }
}

export default function CourseForm() {
    const { course, isComplete, completionText } = useLoaderData<typeof loader>();

    return (
        <div>
            <div className='flex items-center justify-between'>
                <div className='flex flex-col gap-y-2'>
                    <h1 className='text-2xl font-medium'>Course setup</h1>
                    <span className='text-sm text-foreground/60'>
                        Complete all fields {completionText}
                    </span>
                </div>
                <Action
                    disabled={!isComplete}
                    courseSlug={course.slug}
                    isPublished={course.isPublished}
                />

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
                            initialData={course}
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
                            initialData={course}
                            courseSlug={course.slug}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
