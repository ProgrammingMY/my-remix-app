import { json, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { createSupabaseServerClient } from "~/utils/supabase.server";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { drizzle } from "drizzle-orm/d1";
import { Course, CourseType } from "~/db/schema.server";
import { desc, eq } from "drizzle-orm";

export const loader = async ({
  context,
  request,
}: LoaderFunctionArgs) => {
  const { env } = context.cloudflare;
  const { supabaseClient, headers } = createSupabaseServerClient(request, env);

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    throw redirect("/login", {
      headers,
    });
  }

  const db = drizzle(env.DB_drizzle, {
    schema: { Course },
  });

  const courses = await db
    .select()
    .from(Course)
    .where(
      eq(Course.userId, user.id)
    )
    .orderBy(desc(Course.createdAt))

  return json({ courses });
};

export default function TeacherCourses() {
  const data = useLoaderData<typeof loader>();
  const courses = JSON.parse(JSON.stringify(data.courses)) as CourseType[];

  return (
    <>
      <DataTable columns={columns} data={courses} />
    </>
  );
}
