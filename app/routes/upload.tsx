import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import MuxUploader from "@mux/mux-uploader-react";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import Mux from "@mux/mux-node";
import { Button } from "~/components/ui/button";



export const meta: MetaFunction = () => {
  return [
    { title: "Kelas Tech" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};


export const loader = async ({ context, }: LoaderFunctionArgs) => {
  const { env } = context.cloudflare;


  const mux = new Mux({
    tokenId: env.MUX_TOKEN_ID,
    tokenSecret: env.MUX_TOKEN_SECRET,
  });

  if (!mux) {
    throw new Error("Mux is not configured");
  }

  // Create an endpoint for MuxUploader to upload to
  const upload = await mux.video.uploads.create({
    new_asset_settings: {
      playback_policy: ["public"],
      encoding_tier: "baseline",
    },
    // in production, you'll want to change this origin to your-domain.com
    cors_origin: "*",
  });
  return json({ id: upload.id, url: upload.url });
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const uploadId = formData.get("uploadId");
  if (typeof uploadId !== "string") {
    throw new Error("No uploadId found");
  }

  const { env } = context.cloudflare;

  const mux = new Mux({
    tokenId: env.MUX_TOKEN_ID,
    tokenSecret: env.MUX_TOKEN_SECRET,
  });

  if (!mux) {
    return json({ message: "Mux is not configured" }, { status: 500 });
  }

  // when the upload is complete,
  // the upload will have an assetId associated with it
  // we'll use that assetId to view the video status
  const upload = await mux.video.uploads.retrieve(uploadId);
  if (upload.asset_id) {
    return redirect(`/status/${upload.asset_id}`);
  }

  // while onSuccess is a strong indicator that Mux has received the file
  // and created the asset, this isn't a guarantee.
  // In production, you might write an api route
  // to listen for the`video.upload.asset_created` webhook
  // https://docs.mux.com/guides/listen-for-webhooks
  // However, to keep things simple here,
  // we'll just ask the user to push the button again.
  // This should rarely happen.
  return json({ message: "Upload has no asset yet. Try again." });
};

export default function UploadPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [isUploadSuccess, setIsUploadSuccess] = useState(false);

  const { id, url } = loaderData;
  const { message } = actionData ?? {};

  return (
    <Form method="post">
      <MuxUploader endpoint={url} onSuccess={() => setIsUploadSuccess(true)} />
      <input type="hidden" name="uploadId" value={id} />
      {/* 
        you might have other fields here, like name and description,
        that you'll save in your CMS alongside the uploadId and assetId
      */}
      <button type="submit" disabled={!isUploadSuccess}>
        {isUploadSuccess ? "Watch video" : "Waiting for upload..."}
      </button>
      {message ? <p>{message}</p> : null}
      <ul>
        <li>
          <Link to="/dashboard"><Button variant={"outline"}>Profile</Button></Link>
        </li>
        <li>
          <Link to="/login"><Button variant={"default"}>Login</Button></Link>
        </li>
        <li>
          <Link to="/logout"><Button variant={"destructive"}>Log out</Button></Link>
        </li>
      </ul>

    </Form>
  );
}