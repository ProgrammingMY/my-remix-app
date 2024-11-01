
import { ConfirmModal } from "~/components/modals/confirm-modal";
import { Button } from "~/components/ui/button";
import { Trash } from "lucide-react";
import { useState } from "react";
import { useFetcher, useNavigate } from "@remix-run/react";
import { jsonWithError, jsonWithSuccess } from "remix-toast";

interface ChapterActionProps {
    disabled: boolean;
    courseSlug: string;
    chapterId: string;
    isPublished: boolean;
}

const ChapterAction = ({
    disabled,
    courseSlug,
    chapterId,
    isPublished
}: ChapterActionProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const fetcher = useFetcher();

    const onClick = async () => {
        try {
            setIsLoading(true);

            if (isPublished) {
                fetcher.submit({
                    wantPublish: false,
                }, {
                    method: "PATCH",
                    action: `/api/teacher/courses/${courseSlug}/chapters/${chapterId}/publish`,
                    encType: "application/json",
                });
                jsonWithSuccess({ result: "success" }, { message: "Chapter is unpublished." });
            } else {
                fetcher.submit({
                    wantPublish: true,
                }, {
                    method: "PATCH",
                    action: `/api/teacher/courses/${courseSlug}/chapters/${chapterId}/publish`,
                    encType: "application/json",
                });
                jsonWithSuccess({ result: "success" }, { message: "Chapter is published." });
            }
        } catch (error) {
            jsonWithError({ result: "error" }, { message: "Something went wrong." });
        } finally {
            setIsLoading(false);
        }
    }

    const onDelete = async () => {
        try {
            setIsLoading(true);
            fetcher.submit(null, {
                method: "DELETE",
            });
            jsonWithSuccess({ result: "success" }, { message: "Chapter deleted successfully." });
            navigate(`/teacher/courses/${courseSlug}/chapters`);

        } catch (error) {
            jsonWithError({ result: "error" }, { message: "Something went wrong." });
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className="flex items-center gap-x-2">
            <Button
                onClick={onClick}
                disabled={disabled || isLoading}
                variant='default'
                size={'sm'}
            >
                {isPublished ? "Unpublish" : "Publish"}
            </Button>
            <ConfirmModal onConfirm={onDelete}>
                <Button size={'sm'} variant='destructive' disabled={isLoading}>
                    <Trash className='h-4 w-4' />
                </Button>
            </ConfirmModal>
        </div>
    )
}

export default ChapterAction