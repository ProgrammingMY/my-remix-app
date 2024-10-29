import { ActionFunctionArgs } from "@remix-run/cloudflare";
import { handleRequest, route, UploadFileError } from "better-upload/server";
import { r2 } from "better-upload/server/helpers";
import { createSupabaseServerClient } from "~/utils/supabase.server";

const authenticateUser = async ({ request, env }: { request: Request, env: Env }) => {
  const { supabaseClient, headers } = createSupabaseServerClient(request, env);
  const { data: { user } } = await supabaseClient.auth.getUser();

  return user;
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = context.cloudflare;
  const r2Client = r2({
    accountId: env.CF_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY,
    secretAccessKey: env.R2_SECRET_KEY,
  });

  return handleRequest(request, {
    client: r2Client,
    bucketName: "lms-promy",
    routes: {
      bgImage: route({
        fileTypes: ["image/*"],
        multipleFiles: false,
        maxFileSize: 1024 * 1024 * 10,
        onBeforeUpload: async () => {
          const user = await authenticateUser({ request, env });
          if (!user) {
            throw new UploadFileError("Not authenticated")
          }
        }
      }),
    },
  });
}
