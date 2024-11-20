// import { useConfettiStore } from "@/components/hooks/use-confetti-store";
import { ConfirmModal } from "~/components/modals/confirm-modal";
import { Button } from "~/components/ui/button";
import { Trash } from "lucide-react";
import { useState } from "react";
import { jsonWithError, jsonWithSuccess } from "remix-toast";
import { useNavigate } from "@remix-run/react";
import { useFetcher } from "react-router-dom";

interface ActionProps {
    disabled: boolean;
    courseSlug: string;
    isPublished: boolean;
}

const Action = ({
    disabled,
    courseSlug,
    isPublished
}: ActionProps) => {
    const [isLoading, setIsLoading] = useState(false);
    // const confetti = useConfettiStore();
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
                    action: `/api/teacher/courses/${courseSlug}/publish`,
                    encType: "application/json",
                })
                jsonWithSuccess("Success", "Course unpublished successfully.");
            } else {
                fetcher.submit({
                    wantPublish: true,
                }, {
                    method: "PATCH",
                    action: `/api/teacher/courses/${courseSlug}/publish`,
                    encType: "application/json",
                })
                jsonWithSuccess("Success", "Course published successfully.");
                // confetti.onOpen();
            }

        } catch (error) {
            jsonWithError("Error", "Something went wrong.");
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
            jsonWithSuccess("Success", "Course deleted successfully.");
            navigate(`/teacher/courses`);

        } catch (error) {
            jsonWithError("Error", "Something went wrong.");
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

export default Action