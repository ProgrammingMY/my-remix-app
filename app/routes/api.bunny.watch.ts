import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { generateVideoSignature } from "~/utils/bunny.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { env } = context.cloudflare;

  const url = new URL(request.url);

  const videoId = url.searchParams.get("videoId");

  if (!videoId) {
    return new Response("Missing videoId", { status: 400 });
  }

  const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60 * 10; // 10 hours from now

  const signature = generateVideoSignature(
    env.BUNNY_TOKEN_KEY,
    videoId,
    expirationTime
  );

  const response = {
    signature,
    expirationTime,
  };

  // return application json response

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
