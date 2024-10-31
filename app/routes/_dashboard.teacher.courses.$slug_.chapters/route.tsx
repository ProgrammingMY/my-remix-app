"use client";
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
import { ArrowLeft, Loader2, PlusCircle } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Chapter, Course } from '@prisma/client';
import { ChaptersList } from './chapters-list';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import { LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { createSupabaseServerClient } from '~/utils/supabase.server';
import { createPrismaClient } from '~/utils/prisma.server';
import { Link, Outlet, useFetcher, useLoaderData, useNavigate, useParams } from '@remix-run/react';

const formSchema = z.object({
    title: z.string().min(1),
});

export const loader = async ({ context, params, request }: LoaderFunctionArgs) => {
    const { env } = context.cloudflare;
    const { supabaseClient, headers } = createSupabaseServerClient(request, env);

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        return redirect("/login", {
            headers
        });
    };

    const db = createPrismaClient(env);

    const course = await db.course.findUnique({
        where: {
            slug: params.slug,
            userId: user.id,
        },
        include: {
            chapters: {
                orderBy: {
                    position: "asc",
                }
            },
        }
    });

    // if course is not found
    if (!course) {
        return redirect("/courses", {
            headers
        });
    }

    return ({
        course,
    })
}


const ChapterPage = () => {
    const { course } = useLoaderData<typeof loader>();
    const fetcher = useFetcher();
    const navigate = useNavigate();
    const { slug } = useParams();
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const toggleCreating = () => {
        setIsCreating((prev) => !prev);
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { title: "" },
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            fetcher.submit(values, {
                method: "post",
                action: `/api/teacher/courses/${slug}/chapters`,
            });
            jsonWithSuccess("Success", "Chapter created successfully.");
        } catch (error) {
            jsonWithError("Error", "Something went wrong.");
        } finally {
            setIsCreating(false);
        }
    }

    const onReorder = async (updateData: { id: string; position: number }[]) => {
        try {
            setIsUpdating(true);
            const formData = new FormData();
            formData.append('data', JSON.stringify(updateData))
            fetcher.submit(formData, {
                method: 'POST',
                action: `/api/teacher/courses/${slug}/chapters/reorder`
            })
            jsonWithSuccess("Success", "Chapters reordered successfully.");
        } catch (error) {
            jsonWithError("Error", "Something went wrong.");
        } finally {
            setIsUpdating(false);
        }
    }

    const onEdit = (id: string) => {
        navigate(`/teacher/courses/${slug}/chapters/${id}`);
    }


    return (
        <div className='grid grid-flow-row grid-cols-1 md:grid-cols-3 gap-x-6'>
            <Link
                to={`/teacher/courses/${slug}`}
                className='flex items-center text-sm hover:opacity-75 transition mb-6'
            >
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to course
            </Link>
            <div className='relative mt-6 border bg-slate-100 rounded-md p-4 col-start-1' >
                {isUpdating && (
                    <div className='absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-m flex items-center justify-center'>
                        <Loader2 className='h-6 w-6 animate-spin text-sky-700' />
                    </div>
                )}
                <div className='font-medium flex items-center justify-between'>
                    Course Chapters
                    <Button onClick={toggleCreating} variant='ghost' type='button'>
                        {isCreating ? (
                            <>Cancel</>
                        ) : <>
                            <PlusCircle className='h-4 w-4 mr-2' />
                            Add a chapter
                        </>
                        }
                    </Button>
                </div>
                {isCreating && (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mt-4'>
                            <FormField
                                control={form.control}
                                name='title'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                disabled={!isCreating}
                                                placeholder='e.g. Introduction to the course'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type='submit'
                                variant='default'
                                disabled={!isValid || isSubmitting}
                            >
                                Create
                            </Button>
                        </form>
                    </Form>
                )}
                {!isCreating && (
                    <div className={cn(
                        "text-sm mt-2",
                        !course.chapters.length && 'text-slate-500 italic'
                    )}>
                        {!course.chapters.length && "No chapters"}
                        <ChaptersList
                            onEdit={onEdit}
                            onReorder={onReorder}
                            items={course.chapters || []}
                        />
                    </div>
                )}
                {!isCreating && (
                    <p className='text-xs text-muted-foreground mt-4'>
                        Drap and drop to reorder the chapters
                    </p>
                )}
            </div >
            <div className='relative mt-6 border bg-slate-100 rounded-md p-4 col-span-2' >
                <Outlet />
            </div>
        </div>
    )
}

export default ChapterPage;