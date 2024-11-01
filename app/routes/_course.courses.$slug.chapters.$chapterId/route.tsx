import { Banner } from "~/components/banner";
import { Separator } from "~/components/ui/separator";
import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getChapter } from "~/utils/getChapter.server";
import { createPrismaClient } from "~/utils/prisma.server";
import { createSupabaseServerClient } from "~/utils/supabase.server";
import { useLoaderData, useParams } from "@remix-run/react";
import { VideoPlayer } from "./video-player";

export const loader = async ({ params, context, request }: LoaderFunctionArgs) => {
    const { env } = context.cloudflare;
    const { supabaseClient, headers } = createSupabaseServerClient(request, env);

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        return redirect("/login", {
            headers
        });
    };

    const db = createPrismaClient(env);

    const {
        chapter,
        course,
        muxData,
        attachments,
        nextChapter,
        userProgress,
        purchase,
    } = await getChapter({
        userId: user.id,
        courseSlug: params.slug!,
        chapterId: params.chapterId!,
        db
    });

    if (!chapter || !course) {
        return redirect("/courses", {
            headers
        });
    }

    const isLocked = !chapter.isFree && !purchase;
    const completeOnEnd = !!purchase && !userProgress?.isCompleted;

    return {
        chapter,
        course,
        muxData,
        attachments,
        nextChapter,
        userProgress,
        purchase,
        isLocked,
        completeOnEnd
    }
}

const ChapterIdPage = () => {
    const {
        chapter,
        course,
        muxData,
        attachments,
        nextChapter,
        userProgress,
        purchase,
        isLocked,
        completeOnEnd
    } = useLoaderData<typeof loader>();
    const params = useParams();

    return (
        <div>
            {userProgress?.isCompleted && (
                <Banner
                    label="You have completed this chapter"
                    variant="success"
                />
            )}
            {isLocked && (
                <Banner
                    label="You need to purchase this chapter to continue"
                    variant="warning"
                />
            )}
            <div className="flex flex-col max-w-4xl mx-auto pb-20">
                <div className="p-4">
                    <VideoPlayer
                        chapterId={params.id!}
                        title={chapter.title}
                        courseId={params.chapterId!}
                        nextChapterId={nextChapter?.id}
                        playbackId={muxData?.playbackId!}
                        isLocked={isLocked}
                        completeOnEnd={completeOnEnd}
                    />
                </div>
                <div>
                    <div className="p-4 flex flex-col md:flex-row items-center justify-between">
                        <h2 className="text-2xl font-semibold mb-2">
                            {chapter.title}
                        </h2>
                        {/* {purchase ? (
                            <div>
                                <CourseProgressButton
                                    chapterId={params.chapterId}
                                    courseId={params.id}
                                    isCompleted={!!userProgress?.isCompleted}
                                    nextChapterId={nextChapter?.id}
                                />
                            </div>
                        ) : (
                            <CourseEnrollButton
                                courseId={params.id}
                                price={course.price!}
                            />
                        )} */}
                    </div>
                    <Separator />
                    <div>
                        {!!attachments.length && (
                            <>
                                <Separator />
                                {/* <CourseAttachments
                                    attachments={attachments}
                                /> */}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChapterIdPage