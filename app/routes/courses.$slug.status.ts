import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/cloudflare";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import {
  redirectWithError,
  redirectWithSuccess,
  redirectWithWarning,
} from "remix-toast";
import * as schema from "~/db/schema.server";
import { isAuthenticated } from "~/utils/auth.server";

export const loader = async ({
  params,
  context,
  request,
}: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const billCode = url.searchParams.get("billcode");
    const transactionId = url.searchParams.get("transaction_id");

    if (!billCode || !transactionId) {
      return redirectWithWarning("/user", "Invalid bill code");
    }

    const { env } = context.cloudflare;

    const { user, headers } = await isAuthenticated(request, env);

    if (!user) {
      throw redirect("/login");
    }

    const db = drizzle(env.DB_drizzle, { schema });

    const course = await db.query.course.findFirst({
      where: eq(schema.course.slug, params.slug!),
      with: {
        purchases: {
          where: eq(schema.purchase.userId, user.id),
        },
      },
    });

    if (!course) {
      return redirect("/user", {
        headers,
      });
    }

    if (course.purchases.length > 0) {
      return redirectWithWarning(`/courses/${params.slug}`, {
        message: "You have already purchased this course",
      });
    }

    const customer = await db.query.toyyibCustomer.findFirst({
      where: and(
        eq(schema.toyyibCustomer.billCode, billCode),
        eq(schema.toyyibCustomer.userId, user.id),
        eq(schema.toyyibCustomer.courseId, course.id)
      ),
    });

    if (!customer) {
      throw new Error("Invalid bill code");
    }

    const formData = new FormData();
    formData.append("billCode", billCode);

    // get bill status
    const response = await fetch(
      `${env.TOYYIB_URL}/index.php/api/getBillTransactions`,
      {
        method: "POST",
        body: formData,
      }
    );

    const billStatus = (await response.json()) as {
      billpaymentStatus: string;
    }[];
    const status = billStatus[0].billpaymentStatus;

    switch (status) {
      case "1":
        // success status
        await db.insert(schema.purchase).values({
          userId: user.id,
          courseId: course.id,
        });

        return redirectWithSuccess(
          `/courses/${params.slug}`,
          "Course purchased successfully"
        );

      case "2":
      case "4":
        return redirectWithWarning(
          `/courses/${params.slug}`,
          "Payment pending, please check with your bank"
        );

      case "3":
        return redirectWithError(`/courses/${params.slug}`, "Payment failed");

      default:
        return redirectWithError(
          `/courses/${params.slug}`,
          "Something went wrong"
        );
    }
  } catch (error) {
    console.log("[CHECKOUT ACTION ERROR]", error);
    return new Response("Internal server error", { status: 500 });
  }
};

export const action = async ({
  params,
  context,
  request,
}: ActionFunctionArgs) => {};
