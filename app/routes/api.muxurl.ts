import Mux from "@mux/mux-node";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { jsonWithError } from "remix-toast";
import { isAuthenticated } from "~/utils/auth.server";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  try {
    const { env } = context.cloudflare;

    const mux = new Mux({
      tokenId: env.MUX_TOKEN_ID,
      tokenSecret: env.MUX_TOKEN_SECRET,
    });

    if (!mux) {
      return json({ id: "", url: "" });
    }

    const { user, headers } = await isAuthenticated(request, env);

    if (!user) {
      return redirect("/login", {
        headers,
      });
    }

    // make the user is teacher

    // Create an endpoint for MuxUploader to upload to
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ["public"],
        encoding_tier: "baseline",
      },
      // in production, you'll want to change this origin to your-domain.com
      cors_origin: "http://localhost:5173",
    });
    return json({ id: upload.id, url: upload.url });
  } catch (error) {
    console.log("[MUX URL] ERROR", error);
    return json({ id: "", url: "" });
  }
};
