import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { jsonWithError, jsonWithSuccess } from "remix-toast";
import { createPrismaClient } from "~/utils/prisma.server";
import { createSupabaseServerClient } from "~/utils/supabase.server";

export const action = async ({
  context,
  request,
  params,
}: ActionFunctionArgs) => {
  try {
    const { env } = context.cloudflare;

    const { supabaseClient, headers } = createSupabaseServerClient(
      request,
      env
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return redirect("/login", {
        headers,
      });
    }

    const db = createPrismaClient(env);
    const formData = await request.formData();
    const data = JSON.parse(
      JSON.stringify(Object.fromEntries(formData.entries()))
    );

    if (data.price && data.price !== "") {
      data.price = parseFloat(data.price);
    }

    await db.course.update({
      where: {
        slug: params.slug,
        userId: user.id,
      },
      data: { ...data },
    });

    return jsonWithSuccess(
      { result: "Course updated successfully." },
      {
        message: "Success",
      }
    );
  } catch (error) {
    console.log(error);
    return jsonWithError(
      { result: "Something went wrong." },
      { message: "Error" }
    );
  }
};
