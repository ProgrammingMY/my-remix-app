import { useEffect, useState } from "react";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "@hello-pangea/dnd";

import { cn } from "~/lib/utils";
import { ChevronRight, Grip } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { ChapterType } from "~/db/schema.server";
import { Link, useLocation, useParams } from "@remix-run/react";

interface ChaptersListProps {
    items: ChapterType[];
    onEdit: (id: string) => void;
    onReorder: (updateDate: { id: string; position: number }[]) => void;
}

export const ChaptersList = ({ items,
    onEdit,
    onReorder
}: ChaptersListProps
) => {
    const [isMounted, setIsMounted] = useState(false);
    const [chapters, setChapters] = useState(items);
    const { slug } = useParams();
    const pathname = useLocation().pathname;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setChapters(items);
    }, [items]);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(chapters);
        const [reorderItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderItem);

        const startIndex = Math.min(result.source.index, result.destination.index);
        const endIndex = Math.max(result.source.index, result.destination.index);

        const updatedChapters = items.slice(startIndex, endIndex + 1);

        setChapters(items);

        const bulkUpdateData = updatedChapters.map((chapter) => ({
            id: chapter.id,
            position: items.findIndex((item) => item.id === chapter.id)
        }));

        onReorder(bulkUpdateData);
    }

    if (!isMounted) {
        return null;
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="chapters">
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                        {chapters.map((chapter, index) => (
                            <Draggable key={chapter.id} draggableId={chapter.id} index={index}>
                                {(provided) => (
                                    <div className={cn(
                                        "flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm",
                                        pathname.includes(chapter.id) && "bg-sky-100 border-sky-200 text-sky-700"
                                    )}
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                    >
                                        <div className={cn(
                                            "px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transition",
                                            chapter.isPublished && "border-r-sky-200 hover:bg-sky-200",
                                        )}
                                            {...provided.dragHandleProps}
                                        >
                                            <Grip className="h-5 w-5" />

                                        </div>
                                        <Link
                                            to={`/teacher/courses/${slug}/chapters/${chapter.id}`}
                                            className="flex px-2 py-3 justify-between w-full"
                                        >
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
                                                <ChevronRight
                                                    className="h-4 w-4 cursor-pointer hover:opacity-75 transition" />
                                            </div>
                                        </Link>
                                    </div>
                                )}

                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}