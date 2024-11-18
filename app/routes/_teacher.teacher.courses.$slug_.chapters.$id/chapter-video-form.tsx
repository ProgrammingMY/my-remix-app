import * as z from 'zod';
import { Button } from '~/components/ui/button';

import { useEffect, useState } from 'react'
import { Loader2, PlusCircle, Video } from 'lucide-react';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { useFetcher } from '@remix-run/react';
import { BunnyDataType, ChapterType } from '~/db/schema.server';
import BunnyUploader from './chapter-video-uploader';
import BunnyPlayer from '~/components/bunny-player';
import { isVideoReady } from '~/lib/utils';

interface ChapterVideoProps {
    chapter: ChapterType & { bunnyData: BunnyDataType | null };
    courseSlug: string;
    chapterId: string;
}

const formSchema = z.object({
    videoId: z.string().min(1),
    libraryId: z.number(),
});


export const ChapterVideoForm = ({ chapter, courseSlug, chapterId }: ChapterVideoProps) => {
    const [isEditting, setIsEditting] = useState(false);
    const fetcher = useFetcher();

    const toggleEditting = () => {
        setIsEditting((prev) => !prev);
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            fetcher.submit(values, {
                method: "PATCH",
                encType: "application/json",
            })
            jsonWithSuccess({ result: "success" }, { message: "Chapter updated successfully." });
        } catch (error) {
            jsonWithError({ result: "error" }, { message: "Something went wrong." });
        } finally {
            setIsEditting(false);
        }
    }


    return (
        <div className='mt-6 border bg-slate-100 rounded-md p-4' >
            <div className='font-medium flex items-center justify-between'>
                Course video
                <Button onClick={toggleEditting} variant='ghost' type='button'>
                    {isEditting ? (
                        <>Cancel</>
                    ) : (
                        <>
                            <PlusCircle className='h-4 w-4 mr-2' />
                            Upload video
                        </>
                    )}
                </Button>
            </div>
            {!isEditting && (
                !chapter.videoId ? (
                    <div className='flex items-center justify-center h-60 bg-slate-200 rounded-md'>
                        <Video className='h-10 w-10 text-slate-500' />
                    </div>
                ) : (
                    <div className='relative aspect-video mt-2'>
                        {chapter.bunnyData && isVideoReady(chapter.bunnyData.status) && (
                            <BunnyPlayer
                                guid={chapter.bunnyData.videoId}
                                libraryId={chapter.bunnyData.libraryId}
                            />
                        )}
                        {chapter.bunnyData && !isVideoReady(chapter.bunnyData.status) && (
                            <div className='flex items-center justify-center bg-slate-200 rounded-md'>
                                <Loader2 className='h-10 w-10 animate-spin' />
                                Transcoding video... You can leave the page and come back later.
                            </div>
                        )}
                    </div>
                )
            )}
            {isEditting && (
                <BunnyUploader onUploadCompleted={(videoId: string, libraryId: number) => {
                    if (videoId) {
                        onSubmit({ videoId, libraryId });
                    }
                }} />
            )}
            {chapter.videoId && !isEditting && (
                <div className='text-xs text-muted-foreground mt-2'>
                    Videos can take a few minutes to process. Refresh the page if video does not appear.
                </div>
            )}
        </div >
    )
}
