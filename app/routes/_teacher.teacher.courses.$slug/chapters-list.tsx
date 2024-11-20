import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { ChapterType } from "~/db/schema.server";

interface ChaptersListProps {
    items: ChapterType[];
}

export const ChaptersList = ({ items }: ChaptersListProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const [chapters, setChapters] = useState(items);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setChapters(items);
    }, [items]);

    if (!isMounted) {
        return null;
    }

    return (
        <div>
            {chapters.map((chapter, index) => (
                <div className={cn(
                    "flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm",
                    chapter.isPublished && "bg-sky-100 border-sky-200 text-sky-700",
                )}
                    key={index}
                >
                    <div className={cn(
                        "py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transition",
                        chapter.isPublished && "border-r-sky-200 hover:bg-sky-200",
                    )}
                    >
                        <div className="h-5 w-5" />

                    </div>
                    {chapter.title}
                    <div className="ml-auto pr-2 flex items-center gap-x-2">
                        {chapter.isFree && (
                            <Badge>
                                Free
                            </Badge>
                        )}
                        <Badge className={cn(
                            "bg-slate-500",
                            chapter.isPublished && "bg-sky-700"
                        )}>
                            {chapter.isPublished ? "Published" : "Draft"}
                        </Badge>
                    </div>
                </div>

            ))}
        </div>
    )
}