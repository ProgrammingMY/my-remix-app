import Mux from "@mux/mux-node";
import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "~/db/schema.server";

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
      const playbackIds = event.data.playback_ids;
      if (Array.isArray(playbackIds)) {
        const playbackId = playbackIds.find((id) => id.policy === "public") as {
          policy: string;
          id: string;
        };

        const db = drizzle(env.DB_drizzle, { schema });

        if (playbackId) {
          const muxDataExist = await db.query.muxData.findFirst({
            where: eq(schema.muxData.assetId, event.object.id),
          });

          if (muxDataExist) {
            await db
              .update(schema.muxData)
              .set({
                playbackId: playbackId.id,
              })
              .where(eq(schema.muxData.assetId, event.object.id));
          } else {
            await db
              .insert(schema.muxData)
              .values({
                assetId: event.object.id,
                playbackId: playbackId.id,
              })
              .onConflictDoUpdate({
                target: schema.muxData.playbackId,
                set: { playbackId: playbackId.id },
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
