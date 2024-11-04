import { json, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { createSupabaseServerClient } from "~/utils/supabase.server";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { drizzle } from "drizzle-orm/d1";
import { course, CourseType } from "~/db/schema.server";
import { desc, eq } from "drizzle-orm";

export const loader = async ({
  context,
  request,
}: LoaderFunctionArgs) => {
  const { env } = context.cloudflare;
  const { supabaseClient } = createSupabaseServerClient(request, env);

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const db = drizzle(env.DB_drizzle, {
    schema: { course },
  });

  const courses = await db
    .select()
    .from(course)
    .where(
      eq(course.userId, user.id)
    )
    .orderBy(desc(course.createdAt))

  return { courses };
};

export default function TeacherCourses() {
  const { courses } = useLoaderData<typeof loader>();

  return (
    <>
      <DataTable columns={columns} data={courses} />
    </>
  );
}
