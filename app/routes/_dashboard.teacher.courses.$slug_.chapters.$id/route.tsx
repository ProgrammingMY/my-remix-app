
import { ArrowLeft, Eye, LayoutDashboard, Video } from 'lucide-react';
import { IconBadge } from '~/components/icon-badge';
import { Banner } from '~/components/banner';
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { Link, useLoaderData, useParams } from '@remix-run/react';
import { createSupabaseServerClient } from '~/utils/supabase.server';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { ChapterTitleForm } from './chapter-title-form';
import { ChapterAccessForm } from './chapter-access-form';
import { ChapterVideoForm } from './chapter-video-form';
import * as schema from '~/db/schema.server';
import Mux from '@mux/mux-node';
import ChapterAction from './chapter-action';
import { drizzle } from 'drizzle-orm/d1';
import { and, eq } from 'drizzle-orm';
import { ChapterType, MuxDataType } from '~/db/schema.server';


export const action = async ({ context, params, request }: ActionFunctionArgs) => {
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

        const db = drizzle(env.DB_drizzle, { schema });


        const courseOwner = await db.query.course.findFirst({
            where: and(
                eq(schema.course.slug, params.slug!),
                eq(schema.course.userId, user.id)
            ),
        })

        if (!courseOwner) {
            throw jsonWithError("Error", "Course not found");
        }

        // DELETE METHOD
        if (request.method === "DELETE") {
            const chapter = await db.query.chapter.findFirst({
                where: and(
                    eq(schema.chapter.id, params.id!),
                    eq(schema.chapter.courseId, courseOwner.id)
                ),
            });

            if (!chapter) {
                throw jsonWithError("Error", "Course not found");
            }

            if (chapter.uploadId) {
                const mux = new Mux({
                    tokenId: env.MUX_TOKEN_ID,
                    tokenSecret: env.MUX_TOKEN_SECRET,
                });

                if (!mux) {
                    throw new Error("Mux is not configured");
                }

                const existingVideo = await db.query.muxData.findFirst({
                    where: eq(schema.muxData.chapterId, params.id!),
                })

                if (existingVideo) {
                    await mux.video.assets.delete(existingVideo.assetId);
                    await db
                        .delete(schema.muxData)
                        .where(and(
                            eq(schema.muxData.chapterId, params.id!),
                            eq(schema.muxData.assetId, existingVideo.assetId)
                        ));
                }
            }
            await db.delete(schema.chapter).where(eq(schema.chapter.id, params.id!));

            const publishedChaptersinCourse = await db.query.chapter.findMany({
                where: and(
                    eq(schema.chapter.courseId, params.id!),
                    eq(schema.chapter.isPublished, true)
                ),
            });

            if (!publishedChaptersinCourse.length) {
                await db.update(schema.course)
                    .set({
                        isPublished: false,
                    })
                    .where(and(
                        eq(schema.course.slug, params.slug!),
                    ))
            }
            return jsonWithSuccess("Success", "Chapter deleted successfully.");
        }

        // PATCH METHOD
        const values = await request.json() as ChapterType;

        const chapter = await db.update(schema.chapter)
            .set({
                ...values,
            })
            .where(and(
                eq(schema.chapter.id, params.id!),
                eq(schema.chapter.courseId, courseOwner.id)
            ))


        // if user upload video
        if (values.uploadId) {
            const mux = new Mux({
                tokenId: env.MUX_TOKEN_ID,
                tokenSecret: env.MUX_TOKEN_SECRET,
            });

            if (!mux) {
                throw new Error("Mux is not configured");
            }

            // check if mux video already exists
            const existingVideo = await db.query.muxData.findFirst({
                where: eq(schema.muxData.chapterId, params.id!),
            })

            // delete video from mux if it exists
            if (existingVideo) {
                const videoInMux = await mux.video.assets.retrieve(existingVideo.assetId);

                if (videoInMux) {
                    await mux.video.assets.delete(existingVideo.assetId);
                }

                await db
                    .delete(schema.muxData)
                    .where(and(
                        eq(schema.muxData.chapterId, params.id!),
                    ));

            }

            const newMuxVideo = await mux.video.uploads.retrieve(values.uploadId);

            if (newMuxVideo.asset_id) {
                // check if muxData already exist
                await db.
                    insert(schema.muxData)
                    .values({
                        assetId: newMuxVideo.asset_id,
                        chapterId: params.id!,
                    })
                    .onConflictDoUpdate({
                        target: schema.muxData.chapterId,
                        set: { chapterId: params.id! },
                    })
            }
        }

        return jsonWithSuccess("Success", "Chapter updated successfully");

    } catch (error) {
        console.log("[UPDATE CHAPTER] ERROR", error);
        return jsonWithError("Error", "Something went wrong.");
    }

}

export const loader = async ({ context, params, request }: LoaderFunctionArgs) => {
    const { env } = context.cloudflare;

    const { supabaseClient, headers } = createSupabaseServerClient(
        request,
        env
    );

    const {
        data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
        throw redirect("/login", {
            headers,
        });
    }

    const db = drizzle(env.DB_drizzle, { schema });

    const courseOwner = await db.query.course.findFirst({
        where: and(
            eq(schema.course.slug, params.slug!),
            eq(schema.course.userId, user.id)
        ),
    })

    if (!courseOwner) {
        throw jsonWithError("Error", "Course not found");
    }



    const chapter = await db.query.chapter.findFirst({
        where: and(
            eq(schema.chapter.id, params.id!),
            eq(schema.chapter.courseId, courseOwner.id)
        ),
    })

    if (!chapter) {
        throw redirect(`/teacher/courses/${params.slug}/chapters`);
    }

    const muxData = await db.query.muxData.findFirst({
        where: and(
            eq(schema.muxData.chapterId, chapter.id),
        ),
    })

    const requiredField = [
        chapter.title,
        chapter.uploadId,
    ];

    const totalField = requiredField.length;
    const completedField = requiredField.filter(Boolean).length;

    const completionText = `(${completedField}/${totalField})`;

    const isCompleted = requiredField.every(Boolean);

    return {
        chapter,
        muxData,
        isCompleted,
        completionText,
    }
}

const ChapterIdPage = () => {
    const { chapter, muxData, isCompleted, completionText } = useLoaderData<typeof loader>();
    const { slug, id } = useParams();

    return (
        <>
            {!chapter.isPublished && (
                <Banner
                    variant="warning"
                    label="This chapter is not published yet. You can only edit it after it is published."
                />
            )}
            <div className='p-6'>
                <div className='flex items-center justify-between'>
                    <div className='w-full'>
                        <div className='flex items-center justify-between w-full'>
                            <div className='flex flex-col gap-y-2'>
                                <h1 className='text-2xl font-medium'>
                                    Chapter Creating
                                </h1>
                                <span className='text-sm text-slate-700'>
                                    Complete all fields {completionText}

                                </span>
                            </div>
                            <ChapterAction
                                disabled={!isCompleted}
                                courseSlug={slug!}
                                chapterId={id!}
                                isPublished={chapter.isPublished}
                            />
                        </div>
                    </div>
                </div>
                <div className='grid grid-cols-1 gap-y-6 mt-8'>
                    <div className='space-y-4'>
                        <div>
                            <div className='flex items-center gap-x-2'>
                                <IconBadge icon={LayoutDashboard} />
                                <h2 className='text-xl'>
                                    Customize your chapter
                                </h2>
                            </div>
                            <ChapterTitleForm
                                initialData={chapter}
                                courseSlug={slug!}
                                chapterId={id!}
                            />
                            {/* <ChapterDescriptionForm
                                initialData={chapter}
                                courseId={params.courseId}
                                chapterId={params.chapterId}
                            /> */}
                        </div>
                        <div>
                            <div className='flex items-center gap-x-2'>
                                <IconBadge icon={Eye} />
                                <h2 className='text-xl'>
                                    Access Settings
                                </h2>
                            </div>
                            <ChapterAccessForm
                                initialData={chapter}
                                courseSlug={slug!}
                                chapterId={id!}
                            />
                        </div>
                    </div>
                    <div>
                        <div className='flex items-center gap-x-2'>
                            <IconBadge icon={Video} />
                            <h2 className='text-xl'>
                                Add a video
                            </h2>
                        </div>
                        <ChapterVideoForm
                            chapter={chapter}
                            initialData={muxData}
                            courseSlug={slug!}
                            chapterId={id!}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChapterIdPage