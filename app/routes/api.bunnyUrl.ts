import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { generateUploadSignature } from "~/utils/bunny.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { env } = context.cloudflare;

  try {
    // assign title with random string
    const title = crypto.randomUUID();

    const response = await fetch(
      `https://video.bunnycdn.com/library/${env.BUNNY_LIBRARYID}/videos`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          AccessKey: env.BUNNY_API_KEY,
        },
        body: JSON.stringify({ title }),
      }
    );

    if (!response.ok) {
      return json(
        { message: "Failed to create video object" },
        { status: 500 }
      );
    }

    const { guid: videoId } = (await response.json()) as { guid: string };

    const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const authSignature = generateUploadSignature(
      env.BUNNY_LIBRARYID,
      env.BUNNY_API_KEY,
      expirationTime,
      videoId
    );

    const data = {
      signature: authSignature,
      videoId,
      libraryId: env.BUNNY_LIBRARYID,
      expirationTime: expirationTime.toString(),
    };

    return json(
      {
        ...data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("[BUNNY URL] ERROR", error);
    return json({ message: "Something went wrong" }, { status: 500 });
  }
};
