import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";

// components/VideoPlayer.tsx
interface VideoPlayerProps {
    onReady?: () => void;
    autoPlay?: boolean;
    title: string;
    guid: string;
    libraryId: number;
}

interface ResponseProps {
    signature: string;
    expirationTime: number;
}

export default function BunnyPlayer({
    onReady,
    autoPlay = false,
    title,
    guid,
    libraryId,
}: VideoPlayerProps) {
    const [mounted, setMounted] = useState(false);
    const [data, setData] = useState<ResponseProps | null>(null);
    const fetcher = useFetcher();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (fetcher.state === "idle" && !fetcher.data) {
            fetcher.load(`/api/bunny/watch?videoId=${guid}`);
        }
        if (fetcher.data) {
            const res = fetcher.data as ResponseProps;
            if (!res) {
                return;
            }
            setData(res);
            if (onReady) {
                onReady();
            }
        }
    }, [fetcher.state, fetcher.data, mounted]);

    // Server-side and initial client render
    if (!mounted) {
        return <div className="relative w-full aspect-video" />;
    }

    // Loading state
    if (!data) {
        return <div className="relative w-full aspect-video" />;
    }

    return (
        <div className="relative">
            <iframe
                src={`https://iframe.mediadelivery.net/embed/${libraryId}/${guid}/?token=${data.signature}&expires=${data.expirationTime}`}
                loading="lazy"
                className="w-full aspect-video"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen={true}
                title={title}
            />
        </div>
    );
}
