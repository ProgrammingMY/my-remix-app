import Mux from "@mux/mux-node";
import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createPrismaClient } from "~/utils/prisma.server";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  try {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
    const { env } = context.cloudflare;

    const mux = new Mux({
      tokenId: env.MUX_TOKEN_ID,
      tokenSecret: env.MUX_TOKEN_SECRET,
    });

    if (!mux) {
      return new Response("Internal server error", { status: 500 });
    }
    const body = await request.text();

    const event = mux.webhooks.unwrap(
      body,
      request.headers,
      env.MUX_WEBHOOK_SECRET as string
    );

    if (event.type === "video.asset.ready") {
      // add to database
      const db = createPrismaClient(env);
      const playbackIds = event.data.playback_ids;
      if (Array.isArray(playbackIds)) {
        const playbackId = playbackIds.find((id) => id.policy === "public") as {
          policy: string;
          id: string;
        };
        if (playbackId) {
          // update db
          const muxDataExist = await db.muxData.findFirst({
            where: {
              assetId: event.object.id,
            },
          });

          if (muxDataExist) {
            await db.muxData.update({
              where: {
                assetId: event.object.id,
              },
              data: {
                playbackId: playbackId.id,
              },
            });
          } else {
            await db.muxData.create({
              data: {
                assetId: event.object.id,
                playbackId: playbackId.id,
              },
            });
          }
        }
      }
    }

    return json({ message: "ok" });
  } catch (error) {
    console.log(error);
    return new Response("Internal server error", { status: 500 });
  }
};
