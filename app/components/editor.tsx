import { forwardRef, useEffect, useState } from "react";

import 'react-quill-new/dist/quill.snow.css';
import { ClientOnly } from "remix-utils/client-only";


interface EditorProps {
    value: string;
    onChange: (value: string) => void;
};

const modules = {
    toolbar: [
        ['bold', 'italic', 'underline'],
        ['clean'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ],
    clipboard: {
        matchVisual: false // Prevents usage of deprecated mutation events
    }
};

export const Editor = forwardRef<any, EditorProps>(({ value, onChange }, ref) => {
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
                    <Quill theme="snow" value={value} onChange={onChange} modules={modules} ref={ref} />
                ) : (
                    <div>Loading editor...</div>
                )
            }
        </ClientOnly>
    );
});

Editor.displayName = "Editor"; 