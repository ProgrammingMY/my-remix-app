import { useFetcher } from "@remix-run/react";
import { useCallback, useEffect, useState } from "react";
import * as tus from 'tus-js-client';
import Dropzone, { FileRejection } from "react-dropzone-esm";
import { UploadIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { jsonWithError } from "remix-toast";

interface UploadProgress {
  bytesUploaded: number;
  bytesTotal: number;
  percentage: number;
}

interface UploadData {
  signature: string;
  videoId: string;
  libraryId: string;
  expirationTime: string;
}

interface BunnyUploaderProps {
  onUploadCompleted: (videoId: string, libraryId: number) => void;
}

export default function BunnyUploader({
  onUploadCompleted
}: BunnyUploaderProps
) {
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const accept = {
    "image/*": [],
  };
  const fetcher = useFetcher();

  useEffect(() => {
    const uploadFile = async (uploadData: UploadData) => {
      if (!file) return;
      if (!uploadData) return;
      try {
        setError(null);
        setUploading(true);

        // Step 3: Create and start TUS upload
        const upload = new tus.Upload(file, {
          endpoint: 'https://video.bunnycdn.com/tusupload',
          retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
          metadata: {
            filetype: file.type,
            title: file.name,
          },
          headers: {
            'AuthorizationSignature': uploadData.signature,
            'AuthorizationExpire': uploadData.expirationTime,
            'VideoId': uploadData.videoId,
            'LibraryId': uploadData.libraryId
          },
          onError: (error) => {
            console.error('Upload error:', error);
            setError(error.message);
            setUploading(false);
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
            setProgress({ bytesUploaded, bytesTotal, percentage });
          },
          onSuccess: () => {
            onUploadCompleted(uploadData.videoId, parseInt(uploadData.libraryId));
            setFile(null);
            setProgress(null);
            setUploading(false);
            // You can add additional success handling here
          }
        });

        // Check for previous uploads
        const previousUploads = await upload.findPreviousUploads();
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }

        // Start the upload
        upload.start();
      } catch (err: any) {
        console.error('Upload setup error:', err);
        setError(err.message);
        setUploading(false);
      }
    }

    if (fetcher.state === "idle" && fetcher.data) {
      const uploadData = fetcher.data as UploadData;
      uploadFile(uploadData);
    }

  }, [fetcher.state, fetcher.data]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (acceptedFiles.length > 1) {
        return jsonWithError({ result: "Error" }, { message: "Cannot upload more than 1 video" })
      }

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file }) => {
          jsonWithError({ result: "Error" }, { message: `File ${file.name} was rejected` })
        })
      }

      if (acceptedFiles.length === 1 && rejectedFiles.length === 0) {
        setFile(acceptedFiles[0]);
        fetcher.load(`/api/bunnyUrl`);
      }
    },
    [file, setFile]
  )

  return (
    <div className="space-y-4">
      <Dropzone
        onDrop={onDrop}
        maxFiles={1}
        multiple={false}
        disabled={uploading}
        accept={{ "video/*": [] }}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps()}
            className={cn(
              "group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25",
              "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isDragActive && "border-muted-foreground/50",
              uploading && "pointer-events-none opacity-60",
            )}
          >
            <input {...getInputProps()} accept="video/*" />
            {isDragActive ? (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <UploadIcon
                    className="size-7 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <p className="font-medium text-muted-foreground">
                  Drop the files here
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <UploadIcon
                    className="size-7 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-col gap-px">
                  <p className="font-medium text-muted-foreground">
                    Drag {`'n'`} drop files here, or click to select files
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Dropzone>

      {progress && (
        <div className="w-full">
          <div className="bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {progress.percentage}% uploaded
          </p>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm">
          Error: {error}
        </div>
      )}
    </div>
  );
}