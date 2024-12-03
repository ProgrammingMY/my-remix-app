import { useEffect, useState } from "react";

import 'react-quill-new/dist/quill.bubble.css';
import { ClientOnly } from "remix-utils/client-only";


interface PreviewProps {
    value: string;
};

export const Preview = ({ value }: PreviewProps) => {
    // import like this to avoid hydration errors
    // client component still rendered on server side the first time
    const [Quill, setQuill] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            import("react-quill-new")
                .then((QuillModule) => {
                    if (QuillModule && QuillModule.default) {
                        setQuill(() => QuillModule.default);
                    } else {
                        console.error("React Quill module or default export not found");
                    }
                })
                .catch((error) => console.error("Failed to load react-quill", error));
        }
    }, []);

    return (
        <ClientOnly fallback={<div>Loading editor...</div>}>
            {() =>
                Quill ? (
                    <Quill theme="bubble" value={value} readOnly />
                ) : (
                    <div>Loading editor...</div>
                )
            }
        </ClientOnly>
    )
}