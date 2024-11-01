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

type MuxUploaderProps = {
    id: string;
    url: string;
} | null;


const formSchema = z.object({
    uploadId: z.string().min(1),
});


export const ChapterVideoForm = ({ initialData, courseSlug, chapterId }: ChapterVideoProps) => {
    const [isEditting, setIsEditting] = useState(false);
    const [uploadData, setUploadData] = useState<MuxUploaderProps>(null);
    const fetcher = useFetcher();

    const toggleEditting = () => {
        setIsEditting((prev) => !prev);
    }

    useEffect(() => {
        if (fetcher.state === "idle" && !fetcher.data && isEditting) {
            fetcher.load(`/api/muxurl`);
        }
        if (fetcher.data) {
            setUploadData(fetcher.data as { id: string, url: string });
        }

        return () => {
            setUploadData(null);
        }
    }, [fetcher, isEditting]);

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
                        <DialogDescription>
                        </DialogDescription>
                        {uploadData && (
                            <MuxUploader endpoint={uploadData.url} onSuccess={() => onSubmit({ uploadId: uploadData.id })} />
                        )}
                    </DialogContent>
                </Dialog>

            </div>
            {!isEditting && (
                !initialData.uploadId ? (
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
            {initialData.uploadId && !isEditting && (
                <div className='text-xs text-muted-foreground mt-2'>
                    Videos can take a few minutes to process. Refresh the page if video does not appear.
                </div>
            )}
        </div >
    )
}
