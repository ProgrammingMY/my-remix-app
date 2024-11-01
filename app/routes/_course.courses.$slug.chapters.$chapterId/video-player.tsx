// import { useConfettiStore } from "@/components/hooks/use-confetti-store";
import { cn } from "~/lib/utils";
import MuxPlayer from "@mux/mux-player-react";
import { Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { jsonWithError, jsonWithSuccess } from "remix-toast";
import { useNavigate } from "@remix-run/react";

interface VideoPlayerProps {
    chapterId: string;
    title: string;
    courseId: string;
    nextChapterId?: string;
    playbackId: string;
    isLocked: boolean;
    completeOnEnd: boolean;
}

export const VideoPlayer = ({
    chapterId,
    title,
    courseId,
    nextChapterId,
    playbackId,
    isLocked,
    completeOnEnd,
}: VideoPlayerProps) => {
    const [isReady, setIsReady] = useState(false);
    const navigate = useNavigate();

    const onEnded = async () => {
        try {
            if (completeOnEnd) {
                // await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`, {
                //     isCompleted: true,
                // });
            }

            // if (!nextChapterId) {
            //     confetti.onOpen();
            // }
            jsonWithSuccess({ result: "Success" }, { message: "Progress updated" })
            if (nextChapterId) {
                navigate(`/courses/${courseId}/chapters/${nextChapterId}`);
            }

        }
        catch (error) {
            jsonWithError({ result: "Error" }, { message: "Something went wrong" })
        }
    }

    return (
        <div className="relative aspect-video">
            {!isReady && !isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
            )}
            {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary">
                    <Lock className="h-8 w-8" />
                    <p className="text-sm">This chapter is locked</p>
                </div>
            )}
            {!isLocked && (
                <MuxPlayer
                    title={title}
                    className={cn(
                        !isReady && "hidden",
                    )}
                    onCanPlay={() => setIsReady(true)}
                    onEnded={onEnded}
                    autoPlay
                    playbackId={playbackId}
                />
            )}
        </div>
    )
}