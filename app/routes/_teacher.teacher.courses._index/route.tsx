import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { drizzle } from "drizzle-orm/d1";
import { course } from "~/db/schema.server";
import { desc, eq } from "drizzle-orm";
import { isAuthenticated } from "~/utils/auth.server";
import { capitalizeFirstLetter } from "~/lib/format";

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

  return { user, courses };
};

export default function TeacherCourses() {
  const { user, courses } = useLoaderData<typeof loader>();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">
        Welcome, <span>{capitalizeFirstLetter(user?.name ?? "")}!</span>
      </h1>
      <DataTable columns={columns} data={courses} />
    </div>
  );
}
