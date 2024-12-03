import { ChevronsUpDown, Download, File } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "~/components/ui/collapsible"
import { useEffect, useState } from "react"
import { jsonWithError } from "remix-toast"
import { useFetcher, useParams } from "@remix-run/react"
import { AttachmentType } from "~/db/schema.server"
import { Banner } from "~/components/banner"


export function CourseAttachments({
    attachments,
    purchase
}: {
    attachments: (AttachmentType | Pick<AttachmentType, "fileName">)[];
    purchase: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [attachmentName, setAttachmentName] = useState<string | null>(null);
    const fetcher = useFetcher();
    const { slug } = useParams();

    // useEffect(() => {
    //     const getAttachment = async () => {
    //         if (fetcher.state === "idle" && fetcher.data && attachmentName) {
    //             const data = fetcher.data;

    //             try {
    //                 const response = await fetch(data);

    //                 if (response.status !== 200) {
    //                     return jsonWithError({ result: "Error" }, { message: "Something went wrong." });
    //                 }

    //                 const blob = await response.blob();
    //                 const url = URL.createObjectURL(blob);

    //                 // Mobile-friendly download handling
    //                 if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    //                     // For mobile devices, open in new tab
    //                     window.open(url, '_blank');
    //                 } else {
    //                     // For desktop, use the link click approach
    //                     const link = document.createElement("a");
    //                     link.href = url;
    //                     link.download = attachmentName;
    //                     link.click();
    //                 }

    //                 setAttachmentName(null);
    //                 // Delay the URL revocation to ensure download starts
    //                 setTimeout(() => URL.revokeObjectURL(url), 1000);
    //             } catch (error) {
    //                 setAttachmentName(null);
    //                 return jsonWithError({ result: "Error" }, { message: "Something went wrong downloading the file." });
    //             }
    //         }
    //     }

    //     getAttachment();

    // }, [fetcher.state, fetcher.data])

    const onDownload = async (attachment: AttachmentType | Pick<AttachmentType, "fileName">) => {
        // if attachment doesnt have fileurl just return
        if ("fileUrl" in attachment) {
            try {
                setAttachmentName(attachment.fileName);
                // Properly encode the URL parameters
                const encodedSlug = encodeURIComponent(slug!);
                const encodedFileUrl = encodeURIComponent(attachment.fileUrl);
                const response = await fetch(`/api/courses/${encodedSlug}/download/${encodedFileUrl}`);

                if (!response.ok) {
                    throw new Error('Download failed');
                }

                const blob = await response.blob();
                const url = URL.createObjectURL(blob);

                // Mobile-friendly download handling
                if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                    // For mobile devices, use direct download
                    window.location.href = url;
                } else {
                    // For desktop, use the link click approach
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = attachment.fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }

                setTimeout(() => URL.revokeObjectURL(url), 1000);
                setAttachmentName(null);
            } catch (error) {
                setAttachmentName(null);
                jsonWithError({ result: "Error" }, { message: "Failed to download file." });
            }
        }
    };

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="p-4"
        >
            <div className="flex items-center py-2">
                <h4 className="text-sm font-semibold">
                    Course Attachments
                </h4>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-9 p-0 ml-2">
                        <ChevronsUpDown className="h-4 w-4" />
                        <span className="sr-only">Toggle</span>
                    </Button>
                </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-2">
                {!purchase && <Banner variant="warning" label="You need to purchase the course to download the attachments." />}
                {purchase ? attachments.map((attachment) => (
                    <button onClick={() => onDownload(attachment)} key={attachment.fileName} className="flex w-full items-center rounded-md border px-4 py-3 text-sm">
                        <Download className="h-4 w-4 mr-2" />
                        {attachment.fileName}
                    </button>
                )) : attachments.map((attachment) => (
                    <div key={attachment.fileName} className="flex w-full items-center rounded-md border px-4 py-3 text-sm">
                        <File className="h-4 w-4 mr-2" />
                        {attachment.fileName}
                    </div>
                ))}
            </CollapsibleContent>
        </Collapsible>
    )
}
