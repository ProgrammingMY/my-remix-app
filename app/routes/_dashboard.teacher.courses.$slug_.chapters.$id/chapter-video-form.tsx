import * as z from 'zod';
import { Button } from '~/components/ui/button';
import MuxPlayer from '@mux/mux-player-react'

import React, { useEffect, useState } from 'react'
import { Pencil, PlusCircle, Video } from 'lucide-react';
import { Chapter, MuxData } from '@prisma/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { UploadDropzone } from '~/components/ui/upload-dropzone';
import MuxUploader from '@mux/mux-uploader-react';
import { useFetcher } from '@remix-run/react';

interface ChapterVideoProps {
    initialData: Chapter & { muxData?: MuxData | null };
    courseSlug: string;
    chapterId: string;
}


const formSchema = z.object({
    videoUrl: z.string().min(1),
});

const initialState = {
    message: "",
    status: "",
}


export const ChapterVideoForm = ({ initialData, courseSlug, chapterId }: ChapterVideoProps) => {
    const [isEditting, setIsEditting] = useState(false);
    const [uploadId, setUploadId] = useState("");
    const fetcher = useFetcher();

    const toggleEditting = () => {
        setIsEditting((prev) => !prev);
        fetcher.load(`/api/muxurl`);
    }

    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
            const data = fetcher.data as { id: string, url: string };
            if (data.id && data.url) {
                console.log("ID", data.id);
                console.log("URL", data.url);
            }
        }
    }, [fetcher])


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            // await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values);
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
                <Dialog open={isEditting} onOpenChange={setIsEditting}>
                    <DialogTrigger asChild>
                        <Button onClick={toggleEditting} variant='ghost' type='button'>
                            <PlusCircle className='h-4 w-4 mr-2' />
                            Upload image
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload video</DialogTitle>
                        </DialogHeader>
                        <MuxUploader />
                    </DialogContent>
                </Dialog>

            </div>
            {!isEditting && (
                !initialData.videoUrl ? (
                    <div className='flex items-center justify-center h-60 bg-slate-200 rounded-md'>
                        <Video className='h-10 w-10 text-slate-500' />
                    </div>
                ) : (
                    <div className='relative aspect-video mt-2'>
                        <MuxPlayer
                            playbackId={initialData.muxData?.playbackId || ""}
                        />
                    </div>
                )
            )}
            {initialData.videoUrl && !isEditting && (
                <div className='text-xs text-muted-foreground mt-2'>
                    Videos can take a few minutes to process. Refresh the page if video does not appear.
                </div>
            )}
        </div >
    )
}
