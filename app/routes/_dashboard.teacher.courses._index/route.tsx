import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { PlusCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { createSupabaseServerClient } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { createPrismaClient } from "~/utils/prisma.server";

export const loader = async ({
  context,
  params,
  request,
}: LoaderFunctionArgs) => {
  const { env } = context.cloudflare;
  const { supabaseClient, headers } = createSupabaseServerClient(request, env);

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    return redirect("/login", {
      headers,
    });
  }

  const db = createPrismaClient(env);

  const courses = await db.course.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      createdAt: "desc",
    }
  })

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
