import { ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { createEmailVerificationRequest } from "~/utils/verify.server";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "~/db/schema.server";
import { isAuthenticated } from "~/utils/auth.server";

export const loader = async ({ request, context }: ActionFunctionArgs) => {
  const { env } = context.cloudflare;

  const db = drizzle(env.DB_drizzle, { schema });

  const { user, headers } = await isAuthenticated(request, env);

  if (!user) {
    return json({ success: false, message: "User is not authenticated" });
  }

  //   return null;
  await createEmailVerificationRequest({
    request,
    headers,
    userId: user.id,
    email: user.email,
    db,
  });

  return redirect("/verify", {
    headers,
  });
};
