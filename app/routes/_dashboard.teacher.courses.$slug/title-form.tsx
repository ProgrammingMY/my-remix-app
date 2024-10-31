import * as z from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from "~/components/ui/form";
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

import { useState } from 'react'
import { Pencil } from 'lucide-react';
import { CourseFormProps } from '~/lib/types';
import { useFetcher, useNavigate } from '@remix-run/react';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';

// 30 alphanumeric characters and spaces and _ only
const formSchema = z.object({
    title: z.string().min(5).max(30).regex(/^[a-zA-Z0-9\s_]+$/, {
        message: "Max 30 alphanumeric characters, space and '_' only",
    }),
});

function TitleForm({ initialData, courseSlug }: CourseFormProps) {
    const [isEditting, setIsEditting] = useState(false);
    const fetcher = useFetcher();

    const toggleEditting = () => {
        setIsEditting((prev) => !prev);
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData,
    });

    const isLoading = fetcher.state === "loading";

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            fetcher.submit(values, {
                method: "post",
                encType: "application/json",
            });
            jsonWithSuccess({ result: "Course title updated successfully." }, { message: "Success" });
            setIsEditting(false);
        } catch (error) {
            jsonWithError({ result: "Something went wrong." }, { message: "Error" });
        }
    }


    return (
        <div className='border bg-slate-100 rounded-md p-4'>
            <div className='font-medium flex items-center justify-between'>
                Course Title
                <Button onClick={toggleEditting} variant='ghost' type='button'>
                    {isEditting ? (
                        <>Cancel</>
                    ) : <>
                        <Pencil className='h-4 w-4 mr-2' />
                        Edit Title
                    </>
                    }
                </Button>
            </div>
            {!isEditting ? (
                <div className='text-sm mt-2'>
                    {initialData.title}
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mt-4'>
                        <FormField
                            control={form.control}
                            name='title'
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            disabled={!isEditting}
                                            placeholder='e.g. Introduction to Computer Science'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className='flex items-center justify-end mt-6 gap-x-2'>
                            <Button
                                type='submit'
                                variant='default'
                                disabled={isLoading}
                            >
                                Save
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    )
}

export default TitleForm