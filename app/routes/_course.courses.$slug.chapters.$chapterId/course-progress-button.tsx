// import { useConfettiStore } from "@/components/hooks/use-confetti-store";
import { Button } from "~/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { useFetcher, useNavigate } from "@remix-run/react";
import { jsonWithError, jsonWithSuccess } from "remix-toast";

interface CourseProgressButtonProps {
    chapterId: string;
    courseSlug: string;
    isCompleted?: boolean;
    nextChapterId?: string;
}

export const CourseProgressButton = ({
    chapterId,
    courseSlug,
    isCompleted,
    nextChapterId,
}: CourseProgressButtonProps) => {
    const navigate = useNavigate();
    // const confetti = useConfettiStore();
    const [isLoading, setIsLoading] = useState(false);
    const fetcher = useFetcher();

    const onClick = async () => {
        try {
            setIsLoading(true);
            fetcher.submit({
                isCompleted: !isCompleted,
            },
                {
                    method: "PUT",
                    encType: "application/json",
                })

            // if (!isCompleted && !nextChapterId) {
            //     confetti.onOpen();
            // }

            if (!isCompleted && nextChapterId) {
                navigate(`/courses/${courseSlug}/chapters/${nextChapterId}`);
            }

        } catch (error) {
            jsonWithError({ result: "error" }, { message: "Something went wrong." });
        } finally {
            setIsLoading(false);
        }
    }
    const Icon = isCompleted ? XCircle : CheckCircle;

    return (
        <Button
            type="button"
            variant={isCompleted ? "outline" : "sucess"}
            className="w-full md:w-auto"
            onClick={onClick}
            disabled={isLoading}
        >
            {isCompleted ? "Not completed" : "Mark as complete"}
            <Icon className="ml-2 h-4 w-4" />
        </Button>
    )
}
