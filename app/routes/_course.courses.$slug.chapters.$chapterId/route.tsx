import { Banner } from "~/components/banner";
import { Separator } from "~/components/ui/separator";
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getChapter } from "~/utils/getChapter.server";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { VideoPlayer } from "./video-player";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "~/db/schema.server";
import { Button } from "~/components/ui/button";
import { formatPrice } from "~/lib/format";
import { CourseProgressButton } from "./course-progress-button";
import { jsonWithError, jsonWithSuccess } from "remix-toast";
import { CourseAttachments } from "./course-attachments";
import { isAuthenticated } from "~/utils/auth.server";
import { Preview } from "~/components/preview";

export const action = async ({ request, context, params }: ActionFunctionArgs) => {
    try {
        const { env } = context.cloudflare;

        const { user, headers } = await isAuthenticated(request, env);

        if (!user) {
            throw redirect("/login");
        };

        if (request.method === "PUT") {
            const { isCompleted } = (await request.json()) as { isCompleted: boolean };

            const db = drizzle(env.DB_drizzle, { schema });

            await db.insert(schema.userProgress).values({
                userId: user.id,
                chapterId: params.chapterId!,
                isCompleted
            }).onConflictDoUpdate({
                target: [schema.userProgress.userId, schema.userProgress.chapterId],
                set: { isCompleted }
            })

            return jsonWithSuccess("Success", "Course progress updated successfully");
        } else {
            return jsonWithError("Error", "Method not allowed");
        }



    } catch (error) {
        console.log("[COURSE ID CHAPTERS ACTION]", error);
        return jsonWithError("Error", "Something went wrong.");
    }

}

export const loader = async ({ params, context, request }: LoaderFunctionArgs) => {
    const { env } = context.cloudflare;

    const { user, headers } = await isAuthenticated(request, env);

    if (!user) {
        return redirect("/login", {
            headers
        });
    };

    const db = drizzle(env.DB_drizzle, { schema });

    const {
        chapter,
        course,
        bunnyData,
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
        return redirect("/user", {
            headers
        });
    }

    const isLocked = !chapter.isFree && !purchase;
    const completeOnEnd = !!purchase && !userProgress?.isCompleted;

    return {
        chapter,
        course,
        bunnyData,
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
        bunnyData,
        attachments,
        nextChapter,
        userProgress,
        purchase,
        isLocked,
        completeOnEnd
    } = useLoaderData<typeof loader>();
    const params = useParams();
    const navigate = useNavigate();

    const onEnrollClick = async () => {
        return navigate(`/courses/${params.slug}/checkout`)
    }

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
                        courseSlug={params.slug!}
                        nextChapterId={nextChapter?.id}
                        videoId={bunnyData?.videoId}
                        libraryId={bunnyData?.libraryId}
                        isLocked={isLocked}
                        completeOnEnd={completeOnEnd}
                    />
                </div>
                <div>
                    <div className="p-4 flex flex-col md:flex-row items-center justify-between">
                        <h2 className="text-2xl font-semibold mb-2">
                            {chapter.title}
                        </h2>
                        {purchase ? (
                            <div>
                                <CourseProgressButton
                                    chapterId={params.chapterId!}
                                    courseSlug={params.slug!}
                                    isCompleted={!!userProgress?.isCompleted}
                                    nextChapterId={nextChapter?.id}
                                />
                            </div>
                        ) : (
                            <Button onClick={onEnrollClick} size={"sm"} className="w-full md:w-auto">
                                Purchase course for {formatPrice(course.price!)}
                            </Button>
                        )}
                    </div>
                    <Preview
                        value={chapter.description || ""}
                    />
                    <Separator />
                    <div>
                        {!!attachments.length && (
                            <>
                                <Separator />
                                <CourseAttachments
                                    attachments={attachments}
                                    purchase={!!purchase}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChapterIdPage