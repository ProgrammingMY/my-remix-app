import { ActionFunctionArgs } from "@remix-run/cloudflare";
import invariant from "tiny-invariant";

export const action = async ({
  request,
  context,
  params,
}: ActionFunctionArgs) => {
  const { env } = context.cloudflare;

  const { objectKey } = params;

  console.log(objectKey);

  invariant(typeof objectKey === "string", "No objectKey found");

  const obj = await env.BUCKET.get(objectKey);

  console.log(obj);

  if (!obj) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(obj.body);
};
