import { json, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { drizzle } from "drizzle-orm/d1";
import { course, CourseType } from "~/db/schema.server";
import { desc, eq } from "drizzle-orm";
import { isAuthenticated } from "~/utils/auth.server";
import { ClientUserType } from "~/lib/types";

export const loader = async ({
  context,
  request,
}: LoaderFunctionArgs) => {
  const { env } = context.cloudflare;
  const { user, headers } = await isAuthenticated(request, env);

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
