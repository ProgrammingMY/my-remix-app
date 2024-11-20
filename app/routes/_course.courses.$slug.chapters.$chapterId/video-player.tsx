// import { useConfettiStore } from "@/components/hooks/use-confetti-store";
import { Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { jsonWithError, jsonWithSuccess } from "remix-toast";
import { useFetcher, useNavigate } from "@remix-run/react";
import BunnyPlayer from "~/components/bunny-player";

interface VideoPlayerProps {
    chapterId: string;
    title: string;
    courseSlug: string;
    nextChapterId?: string;
    videoId?: string;
    libraryId?: number;
    isLocked: boolean;
    completeOnEnd: boolean;
}

export const VideoPlayer = ({
    chapterId,
    title,
    courseSlug,
    nextChapterId,
    videoId,
    libraryId,
    isLocked,
    completeOnEnd,
}: VideoPlayerProps) => {
    const [isReady, setIsReady] = useState(false);
    const navigate = useNavigate();
    const fetcher = useFetcher();

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
            {!isLocked && videoId && libraryId && (
                <BunnyPlayer
                    title={title}
                    guid={videoId}
                    libraryId={libraryId}
                />
            )}
        </div>
    )
}