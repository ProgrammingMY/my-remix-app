
import * as z from 'zod';
import { Button } from '~/components/ui/button';

import { useState } from 'react'
import { ImageIcon, PlusCircle } from 'lucide-react';
import { CourseFormProps } from '~/lib/types';
import { UploadDropzone } from '~/components/ui/upload-dropzone';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { useFetcher, useNavigate } from '@remix-run/react';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';


const formSchema = z.object({
    imageUrl: z.string().min(1, {
        message: "Image is required",
    }),
});


export const ImageForm = ({ initialData, courseSlug }: CourseFormProps) => {
    const [isEditting, setIsEditting] = useState(false);
    const navigate = useNavigate();
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
            jsonWithSuccess(
                { result: "Success" },
                {
                    message: "Course updated successfully.",
                }
            );
        } catch (error) {
            jsonWithError(
                { result: "Error" },
                { message: "Something went wrong." }
            )
        } finally {
            setIsEditting(false);
        }
    }


    return (
        <div className='border bg-slate-100 rounded-md p-4' >
            <div className='font-medium flex items-center justify-between'>
                Course Image
                <Dialog open={isEditting} onOpenChange={setIsEditting}>
                    <DialogTrigger asChild>
                        <Button onClick={toggleEditting} variant='ghost' type='button'>
                            <PlusCircle className='h-4 w-4 mr-2' />
                            Upload image
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
                            route='bgImage'
                            accept='image/*'
                            multiple={false}
                            maxFileCount={1}
                            description={{
                                maxFiles: 1,
                                maxFileSize: '10MB',
                                fileTypes: 'JPEG, PNG',
                            }}
                            onUploadComplete={({ files, metadata }) => {
                                if (files.length > 0) {
                                    onSubmit({ imageUrl: files[0].objectKey });
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
            {!isEditting ? (
                !initialData.imageUrl ? (
                    <div className='flex items-center justify-center h-60 bg-slate-200 rounded-md'>
                        <ImageIcon className='h-10 w-10 text-slate-500' />
                    </div>
                ) : (
                    <div className='relative aspect-video mt-2'>
                        <img src={`https://bucket.programmingmy.com/${initialData.imageUrl}`} alt="Course image" />
                    </div>
                )
            ) : (
                <div>

                </div>
            )}
        </div >
    )
}
