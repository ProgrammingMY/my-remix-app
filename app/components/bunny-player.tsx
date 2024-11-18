// components/VideoPlayer.tsx
interface VideoPlayerProps {
    guid: string;
    libraryId: number;
}

export default function BunnyPlayer({
    guid,
    libraryId,
}: VideoPlayerProps) {
    return (
        <div className="relative">
            <iframe
                src={`https://iframe.mediadelivery.net/embed/${libraryId}/${guid}`}
                loading="lazy"
                className="w-full aspect-video"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen={true}
            />
        </div>

    )
}
