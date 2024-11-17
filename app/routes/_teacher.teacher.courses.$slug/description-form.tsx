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

import { useState } from 'react'
import { Pencil } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Textarea } from '~/components/ui/textarea';
import { useFetcher, useNavigate } from '@remix-run/react';

interface TitleFormProps {
    initialData: {
        description: string | null;
    };
    courseSlug: string;
}

// 100 alphanumeric characters and spaces and _ only
const formSchema = z.object({
    description: z.string().min(5).max(100).regex(/^[a-zA-Z0-9\s_]+$/, {
        message: "Max 100 alphanumeric characters, space and '_' only",
    }),
});


export const DescriptionForm = ({ initialData, courseSlug }: TitleFormProps) => {
    const [isEditting, setIsEditting] = useState(false);
    const navigate = useNavigate();
    const fetcher = useFetcher();

    const toggleEditting = () => {
        setIsEditting((prev) => !prev);
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { description: initialData?.description || "" },
    });

    const isLoading = fetcher.state === "submitting" || fetcher.state === "loading";

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            fetcher.submit(values, {
                method: "PATCH",
            });
            setIsEditting(false);
        } catch (error) {

        }
    }


    return (
        <div className='border bg-slate-100 rounded-md p-4' >
            <div className='font-medium flex items-center justify-between'>
                Course Description
                <Button onClick={toggleEditting} variant='ghost' type='button'>
                    {isEditting ? (
                        <>Cancel</>
                    ) : <>
                        <Pencil className='h-4 w-4 mr-2' />
                        Edit Description
                    </>
                    }
                </Button>
            </div>
            {!isEditting ? (
                <p className={cn("text-sm mt-2", !initialData.description && "text-slate-500 italic")}>
                    {fetcher.formData ? fetcher.formData.get("description") as string : initialData.description || "No description"}
                </p>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mt-4'>
                        <FormField
                            control={form.control}
                            name='description'
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea
                                            disabled={!isEditting}
                                            placeholder='e.g. This course is about...'
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
        </div >
    )
}
