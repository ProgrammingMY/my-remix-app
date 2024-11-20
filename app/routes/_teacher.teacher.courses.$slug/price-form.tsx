
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
import { cn } from '~/lib/utils';
import { formatPrice } from '~/lib/format';
import { useFetcher } from '@remix-run/react';
import { CourseType } from '~/db/schema.server';

const formSchema = z.object({
    price: z.coerce.number().min(0),
});

interface PriceFormProps {
    initialData: CourseType;
    courseSlug: string;
}


export const PriceForm = ({ initialData, courseSlug }: PriceFormProps) => {
    const [isEditting, setIsEditting] = useState(false);
    const fetcher = useFetcher();

    const toggleEditting = () => {
        setIsEditting((prev) => !prev);
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { price: initialData?.price || undefined },
    });

    const isLoading = fetcher.state === "loading";

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
                Course Price
                <Button onClick={toggleEditting} variant='ghost' type='button'>
                    {isEditting ? (
                        <>Cancel</>
                    ) : <>
                        <Pencil className='h-4 w-4 mr-2' />
                        Edit Price
                    </>
                    }
                </Button>
            </div>
            {!isEditting ? (
                <p className={cn("text-sm mt-2", !initialData.price && "text-slate-500 italic")}>
                    {
                        initialData.price
                            ? formatPrice(initialData.price)
                            : "Free course"
                    }
                </p>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mt-4'>
                        <FormField
                            control={form.control}
                            name='price'
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            type='number'
                                            step={0.01}
                                            disabled={!isEditting}
                                            placeholder='Set the price of your course'
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
