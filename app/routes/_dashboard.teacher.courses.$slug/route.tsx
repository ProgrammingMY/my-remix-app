import { IconBadge } from "~/components/icon-badge";
import TitleForm from "./title-form";
import { CircleDollarSign, File, LayoutDashboard, ListCheck } from "lucide-react";
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { createSupabaseServerClient } from "~/utils/supabase.server";
import { createPrismaClient } from "~/utils/prisma.server";
import { useLoaderData } from "@remix-run/react";
import { DescriptionForm } from "./description-form";
import { PriceForm } from "./price-form";
import { ImageForm } from "./image-form";
import { AttachmentForm } from "./attachment-form";
import { ChaptersForm } from "./chapters-form";
import { jsonWithError, jsonWithSuccess } from "remix-toast";
import { Course } from "@prisma/client";

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

        const db = createPrismaClient(env);
        const values = await request.json() as Course;

        await db.course.update({
            where: {
                slug: params.slug,
                userId: user.id,
            },
            data: { ...values },
        });

        return jsonWithSuccess(
            { result: "Course updated successfully." },
            {
                message: "Success",
            }
        );
    } catch (error) {
        console.log(error);
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

    const db = createPrismaClient(env);

    const course = await db.course.findUnique({
        where: {
            slug: params.slug,
            userId: user.id,
        },
        include: {
            chapters: {
                orderBy: {
                    position: "asc",
                }
            },
            attachments: {
                orderBy: {
                    createdAt: "desc",
                },
            },
        }
    });

    if (!course) {
        return redirect("/teacher/courses");
    }

    const requiredField = [
        course.title,
        course.description,
        course.imageUrl,
        course.price,
        course.categoryId,
        course.chapters.some(chapter => chapter.isPublished)
    ];

    const totalField = requiredField.length;
    const completedField = requiredField.filter(Boolean).length;

    const completionText = `(${completedField}/${totalField})`;

    const isComplete = requiredField.every(Boolean);

    return ({
        course,
        isComplete,
        completionText,
    })
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
                {/* <Action
                    disabled={!isComplete}
                    courseId={course.id}
                    isPublished={course.isPublished}
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
