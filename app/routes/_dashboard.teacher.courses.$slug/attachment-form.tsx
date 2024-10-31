import * as z from 'zod';
import { Button } from '~/components/ui/button';

import React, { useState } from 'react'
import { File, Loader2, PlusCircle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Attachment, Course } from '@prisma/client';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { UploadDropzone } from '~/components/ui/upload-dropzone';

interface AttachmentFormProps {
    initialData: Course & { attachments: Attachment[] };
    courseSlug: string;
}

const formSchema = z.array(z.object({
    url: z.string().min(1),
    name: z.string().min(1),
}));


export const AttachmentForm = ({ initialData, courseSlug }: AttachmentFormProps) => {
    const [isEditting, setIsEditting] = useState(false);
    const [deletingId, setdeletingId] = useState<string | null>(null);

    const toggleEditting = () => {
        setIsEditting((prev) => !prev);
    }


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            console.log(values);
            jsonWithSuccess({ result: "Success" }, { message: "Image uploaded successfully." });
            setIsEditting(false);
        } catch (error) {
            jsonWithError({ result: "Error" }, { message: "Something went wrong." });
        }
    }

    const onDelete = async (id: string) => {
        try {
            // await axios.delete(`/api/courses/${courseId}/attachments/${id}`);
            jsonWithSuccess({ result: "Success" }, { message: "Attachment deleted successfully." });
        } catch (error) {
            jsonWithError({ result: "Error" }, { message: "Something went wrong." });
        } finally {
            setdeletingId(null);
        }
    }


    return (
        <div className='mt-6 border bg-slate-100 rounded-md p-4' >
            <div className='font-medium flex items-center justify-between'>
                Course Attachments
                <Dialog open={isEditting} onOpenChange={setIsEditting}>
                    <DialogTrigger asChild>
                        <Button onClick={toggleEditting} variant='ghost' type='button'>
                            <PlusCircle className='h-4 w-4 mr-2' />
                            Add a file
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload files</DialogTitle>
                            <DialogDescription>
                                Drag and drop your files here or click to browse.
                            </DialogDescription>
                        </DialogHeader>
                        <UploadDropzone
                            route='attachment'
                            accept='*'
                            multiple
                            maxFileCount={5}
                            description={{
                                maxFiles: 5,
                                maxFileSize: '10MB',
                                fileTypes: 'Any',
                            }}
                            onUploadComplete={({ files, metadata }) => {
                                // update all files in db
                                if (files.length > 0) {
                                    onSubmit(files.map((file) => ({ url: file.objectKey, name: file.name })));
                                }
                                jsonWithSuccess({ result: "Success" }, { message: "Course updated successfully." });
                            }}
                            onUploadError={(error) => {
                                jsonWithError({ result: "Error" }, { message: "Something went wrong." });
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>
            {!isEditting && (
                <>
                    {initialData.attachments.length === 0 && (
                        <p className='text-sm mt-2 text-slate-500 italic'>No attachments</p>
                    )}
                    {initialData.attachments.length > 0 && (
                        <div className='space-y-2'>
                            {initialData.attachments.map((attachment) => (
                                <div key={attachment.id} className='flex items-center p-3 w-full bg-sky-100 border text-sky-700 rounded-md'>
                                    <File className='h-4 w-4 mr-2 flex-shrink-0' />
                                    <p className='text-xs line-clamp-1'>{attachment.fileName}</p>
                                    {deletingId === attachment.id && (
                                        <div>
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                        </div>
                                    )}
                                    {deletingId === attachment.id && (
                                        <Button onClick={() => onDelete(attachment.id)} className='ml-auto hover:opacity-75 transition'>
                                            <X className='h-4 w-4' />
                                        </Button>
                                    )}
                                </div>
                            ))}

                        </div>
                    )}
                </>
            )}
        </div >
    )
}
