
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

    useEffect(() => {
        const getAttachment = async () => {
            if (fetcher.state === "idle" && fetcher.data && attachmentName) {
                const data = fetcher.data as string;

                const response = await fetch(data);

                if (response.status !== 200) {
                    return jsonWithError({ result: "Error" }, { message: "Something went wrong." });
                }

                const blob = URL.createObjectURL(await response.blob());

                const link = document.createElement("a");
                link.href = blob;
                link.download = attachmentName;
                link.click();

                setAttachmentName(null);
                URL.revokeObjectURL(blob);
            }
        }

        getAttachment();

    }, [fetcher.state, fetcher.data])

    const onDownload = async (attachment: AttachmentType | Pick<AttachmentType, "fileName">) => {
        try {
            if ("fileUrl" in attachment) {
                setAttachmentName(attachment.fileName);
                fetcher.load(`/api/courses/${slug}/download/${attachment.fileUrl}`);
            }
        } catch (error) {
            setAttachmentName(null);
            return jsonWithError({ result: "Error" }, { message: "Something went wrong." });
        }
    }

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
