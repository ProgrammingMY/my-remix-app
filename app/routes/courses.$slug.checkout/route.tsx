import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"
import { drizzle } from "drizzle-orm/d1";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import * as schema from "~/db/schema.server";
import { and, eq } from "drizzle-orm";
import { Form, useLoaderData, useParams } from "@remix-run/react";
import PurchaseStatusCard from "./purchase-status-card";
import { formatPrice } from "~/lib/format";
import { jsonWithError, jsonWithSuccess, redirectWithWarning } from "remix-toast";
import { Button } from "~/components/ui/button";
import { CreditCard } from "lucide-react";
import { isAuthenticated } from "~/utils/auth.server";

export const action = async ({ request, context, params }: ActionFunctionArgs) => {
    try {
        const { env } = context.cloudflare;

        const { user, headers } = await isAuthenticated(request, env);

        if (!user) {
            throw redirect("/login");
        };

        const db = drizzle(env.DB_drizzle, { schema });

        const course = await db.query.course.findFirst({
            where: eq(schema.course.slug, params.slug!),
            with: {
                purchases: {
                    where: eq(schema.purchase.userId, user.id),
                }
            }
        })

        if (!course) {
            throw redirect("/user");
        }

        if (course.purchases.length > 0) {
            return redirectWithWarning(`/courses/${params.slug}`, "You have already purchased this course");
        }

        // define toyyib pay bill details
        const billDetails = {
            userSecretKey: env.TOYYIB_SECRET_KEY,
            categoryCode: env.TOYYIB_CATEGORY_ID,
            billName: course.title,
            billDescription: course.description,
            billPriceSetting: "1",
            billPayorInfo: "0",
            billAmount: (course.price! * 100).toString(), // convert to cents
            billReturnUrl: `${env.REMIX_PUBLIC_APP_URL}/courses/${course.slug}/status`,
            billCallbackUrl: `${env.REMIX_PUBLIC_APP_URL}/courses/${course.slug}/status`, // successful payment
            billPaymentChannel: "0",
            billExpiryDays: "1",
        };

        const formData = new FormData();
        for (const [key, value] of Object.entries(billDetails)) {
            formData.append(key, value as string);
        }

        const response = await fetch(`${env.TOYYIB_URL}/index.php/api/createBill`, {
            method: "POST",
            body: formData,
        });

        const bill = await response.json() as { BillCode: string }[];

        await db.insert(schema.toyyibCustomer).values({
            userId: user.id,
            courseId: course.id,
            billCode: bill[0].BillCode,
            status: "started",
        }).onConflictDoUpdate({
            target: [schema.toyyibCustomer.userId, schema.toyyibCustomer.courseId],
            set: { billCode: bill[0].BillCode }
        });

        const checkoutUrl = `${env.TOYYIB_URL}/${bill[0].BillCode}`;

        return redirect(checkoutUrl);

    } catch (error) {
        console.log("[CHECKOUT ACTION]", error);
        return jsonWithError(`/courses/${params.slug}`, "Something went wrong.");
    }
}

export const loader = async ({ params, context, request }: LoaderFunctionArgs) => {
    const { env } = context.cloudflare;

    const { user, headers } = await isAuthenticated(request, env);

    if (!user) {
        throw redirect("/login");
    };

    const { slug } = params;

    const db = drizzle(env.DB_drizzle, { schema });

    const course = await db.query.course.findFirst({
        where: eq(schema.course.slug, slug!),
        with: {
            purchases: {
                where: eq(schema.purchase.userId, user.id),
            },
        }
    });

    const toyyibCustomer = await db.query.toyyibCustomer.findFirst({
        where: and(
            eq(schema.toyyibCustomer.userId, user.id),
            eq(schema.toyyibCustomer.courseId, course?.id!)
        )
    });

    if (!course) {
        throw redirect("/user");
    };

    if (toyyibCustomer?.status === "success" || toyyibCustomer?.status === "pending") {
        return redirect(`/courses/${slug}/status?billcode=${toyyibCustomer?.billCode}&transaction_id=${toyyibCustomer?.transactionId}`);
    };

    return {
        course,
    }

}

export default function CheckoutPage() {
    const { course } = useLoaderData<typeof loader>();
    const params = useParams();

    return (
        <div className="flex items-center justify-center mx-auto bg-slate-100/50 h-screen">
            <Card className="w-[450px] flex flex-col items-center justify-center text-center gap-y-4">
                {course.purchases.length > 0 ?
                    <PurchaseStatusCard courseSlug={params.slug!} />
                    :
                    <>
                        <CardHeader>
                            <CardTitle className="mb-2">Checkout</CardTitle>
                            <Separator />
                        </CardHeader>
                        <CardContent className="grid gap-y-4">
                            <img className="rounded-md" src={`https://bucket.programmingmy.com/${course.imageUrl!}`} alt={course?.title} />
                            <CardTitle>
                                {course?.title}
                            </CardTitle>
                            <CardDescription>
                                {course?.description}
                            </CardDescription>
                        </CardContent>
                        <CardContent className="grid gap-y-4">
                            <Separator />
                            <div>
                                <h2>Total</h2>
                                <h1 className="font-medium text-2xl">
                                    {formatPrice(course.price!)}
                                </h1>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Form method="post">
                                <Button type="submit" variant="default" disabled={!!course.purchases.length}>
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Pay with Toyyib Pay
                                </Button>
                            </Form>
                        </CardFooter>
                    </>
                }
            </Card>
        </div>
    )
}
