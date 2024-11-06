
import { ChevronsUpDown, Download } from "lucide-react"

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
// import { getDownloadURL } from "~/components/upload-component/download-action"


export function CourseAttachments({
    attachments
}: {
    attachments: AttachmentType[]
}) {
    const [isOpen, setIsOpen] = useState(false);
    const fetcher = useFetcher();
    const { slug } = useParams();

    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
            const data = fetcher.data as Response;

            console.log(data);
        }
    }, [fetcher])

    const onDownload = async (attachment: AttachmentType) => {
        try {
            fetcher.load(`/api/courses/${slug}/download/${attachment.fileUrl}`);



            // if (data.status !== "200") {
            //     throw new Error("Something went wrong");
            // }

            // const response = await fetch(data.data, {
            //     method: "GET",
            // });

            // if (response.status !== 200) {
            //     throw new Error("Something went wrong");
            // }

            // const blob = URL.createObjectURL(await response.blob());

            // const link = document.createElement("a");
            // link.href = blob;
            // link.download = attachment.fileName;
            // link.click();

        } catch (error) {
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
                {attachments.map((attachment) => (
                    <button onClick={() => onDownload(attachment)} key={attachment.fileName} className="flex w-full items-center rounded-md border px-4 py-3 text-sm">
                        <Download className="h-4 w-4 mr-2" />
                        {attachment.fileName}
                    </button>
                ))}
            </CollapsibleContent>
        </Collapsible>
    )
}
