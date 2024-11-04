import { Button } from '~/components/ui/button';
import { ExternalLinkIcon } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Chapter, Course } from '@prisma/client';
import { ChaptersList } from './chapters-list';
import { useNavigate } from '@remix-run/react';
import { ChapterType, CourseType } from '~/db/schema.server';

interface ChapterFormProps {
    initialData: CourseType & { chapters: ChapterType[] };
    courseSlug: string;
}


export const ChaptersForm = ({ initialData, courseSlug }: ChapterFormProps) => {
    const navigate = useNavigate();

    const onEdit = () => {
        navigate(`/teacher/courses/${courseSlug}/chapters/`);
    }

    return (
        <div className='relative mt-6 border bg-slate-100 rounded-md p-4' >
            <div className='font-medium flex items-center justify-between'>
                Course Chapters
                <Button onClick={onEdit} variant='ghost' type='button'>
                    <ExternalLinkIcon className='h-4 w-4' />
                    Go to chapters editor
                </Button>
            </div>
            <div className={cn(
                "text-sm mt-2",
                !initialData.chapters.length && 'text-slate-500 italic'
            )}>
                {!initialData.chapters.length && "No chapters"}
                <ChaptersList
                    items={initialData.chapters || []}
                />
            </div>
        </div >
    )
}
