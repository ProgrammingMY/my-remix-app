
import { ArrowLeft, Eye, LayoutDashboard, Video } from 'lucide-react';
import { IconBadge } from '~/components/icon-badge';
import { Banner } from '~/components/banner';
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { createPrismaClient } from '~/utils/prisma.server';
import { Link, useLoaderData, useParams } from '@remix-run/react';
import { createSupabaseServerClient } from '~/utils/supabase.server';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { ChapterTitleForm } from './chapter-title-form';
import { ChapterAccessForm } from './chapter-access-form';
import { Chapter } from '@prisma/client';
import { ChapterVideoForm } from './chapter-video-form';
import Mux from '@mux/mux-node';
import ChapterAction from './chapter-action';

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

        const db = createPrismaClient(env);

        const courseOwner = await db.course.findUnique({
            where: {
                slug: params.slug,
                userId: user.id,
            },
        });

        if (!courseOwner) {
            return jsonWithError("Error", "Course not found");
        }

        // DELETE METHOD
        if (request.method === "DELETE") {
            const chapter = await db.chapter.findUnique({
                where: {
                    courseId: courseOwner.id,
                    id: params.id,
                },
            });

            if (!chapter) {
                return jsonWithError("Error", "Course not found");
            }

            if (chapter.uploadId) {
                const mux = new Mux({
                    tokenId: env.MUX_TOKEN_ID,
                    tokenSecret: env.MUX_TOKEN_SECRET,
                });

                if (!mux) {
                    throw new Error("Mux is not configured");
                }

                const existingVideo = await db.muxData.findFirst({
                    where: {
                        chapterId: params.id,
                    },
                });

                if (existingVideo) {
                    await mux.video.assets.delete(existingVideo.assetId);
                    await db.muxData.delete({
                        where: {
                            chapterId: params.id,
                            assetId: existingVideo.assetId,
                        },
                    });
                }
            }

            const deletedChapter = await db.chapter.delete({
                where: {
                    id: params.id,
                },
            });

            const publishedChaptersinCourse = await db.chapter.findMany({
                where: {
                    courseId: params.id,
                    isPublished: true,
                },
            });

            if (!publishedChaptersinCourse.length) {
                await db.course.update({
                    where: {
                        slug: params.slug,
                    },
                    data: {
                        isPublished: false,
                    },
                });
            }

            return jsonWithSuccess("Success", "Chapter deleted successfully.");
        }

        // PATCH METHOD
        const values = await request.json() as Chapter;

        const chapter = await db.chapter.update({
            where: {
                id: params.id,
                courseId: courseOwner.id,
            },
            data: {
                ...values,
            },
        });

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
            const existingVideo = await db.muxData.findFirst({
                where: {
                    chapterId: params.id,
                },
            });

            // delete video from mux if it exists
            if (existingVideo) {
                const videoInMux = await mux.video.assets.retrieve(existingVideo.assetId);

                if (videoInMux) {
                    await mux.video.assets.delete(existingVideo.assetId);
                }

                await db.muxData.delete({
                    where: {
                        chapterId: params.id,
                    },
                });
            }

            const newMuxVideo = await mux.video.uploads.retrieve(values.uploadId);

            if (newMuxVideo.asset_id) {
                // check if muxData already exist
                const muxDataExist = await db.muxData.findFirst({
                    where: {
                        assetId: newMuxVideo.asset_id,
                    },
                });

                if (muxDataExist) {
                    await db.muxData.update({
                        where: {
                            assetId: newMuxVideo.asset_id,
                        },
                        data: {
                            chapterId: params.id!,
                        },
                    });
                } else {
                    await db.muxData.create({
                        data: {
                            assetId: newMuxVideo.asset_id,
                            chapterId: params.id!,
                        },
                    });
                }
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
    const db = createPrismaClient(env);

    const chapter = await db.chapter.findUnique({
        where: {
            id: params.id,
            course: {
                slug: params.slug
            }
        },
        include: {
            muxData: true,
        }
    });

    if (!chapter) {
        return redirect(`/teacher/courses/${params.slug}/chapters`);
    }

    const requiredField = [
        chapter.title,
        chapter.uploadId,
    ];

    const totalField = requiredField.length;
    const completedField = requiredField.filter(Boolean).length;

    const completionText = `(${completedField}/${totalField})`;

    const isCompleted = requiredField.every(Boolean);

    return ({
        chapter,
        isCompleted,
        completionText,
    })
}

const ChapterIdPage = () => {
    const { chapter, isCompleted, completionText } = useLoaderData<typeof loader>();
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
                            initialData={chapter}
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