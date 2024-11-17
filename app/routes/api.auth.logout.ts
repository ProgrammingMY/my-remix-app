import { ActionFunctionArgs } from "@remix-run/cloudflare";
import { logout } from "~/utils/auth.server";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const { env } = context.cloudflare;

  return await logout(request, env, {
    redirectTo: "/",
  });
};
