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
import { Form, Link, useLoaderData, useParams } from "@remix-run/react";
import PurchaseStatusCard from "./purchase-status-card";
import { formatPrice } from "~/lib/format";
import { jsonWithError, jsonWithSuccess, redirectWithWarning } from "remix-toast";
import { Button } from "~/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";
import { isAuthenticated } from "~/utils/auth.server";
import { Preview } from "~/components/preview";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

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
        const courseTitle = "Pembelian Course di Kelas Tech";

        // define toyyib pay bill details
        const billDetails = {
            userSecretKey: env.TOYYIB_SECRET_KEY,
            categoryCode: env.TOYYIB_CATEGORY_ID,
            billName: courseTitle,
            billDescription: course.title,
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

    if (course.purchases.length > 0) {
        return redirect(`/courses/${slug}`);
    }

    return {
        course,
    }

}

export default function CheckoutPage() {
    const { course } = useLoaderData<typeof loader>();
    const params = useParams();

    return (
        <div className="grid items-center justify-center mx-auto bg-slate-100/50 min-h-screen py-8">
            <div className="container px-4 max-w-6xl grid md:grid-cols-2 gap-8">
                {/* Left Column - User Information */}
                <div className="space-y-6">

                    <Card>
                        <CardHeader>
                            {/* back button */}
                            <Link to={`/courses/${params.slug}`} className="flex items-center gap-2 mb-4">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Course
                            </Link>
                            <CardTitle>Payment</CardTitle>
                            <CardDescription className="hidden">Please verify your information before proceeding</CardDescription>
                        </CardHeader>
                        <CardContent >
                            <Form method="post" className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    By proceeding, you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
                                </p>
                                <Button type="submit" className="w-full">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Proceed with ToyyibPay
                                </Button>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
                {/* Right Column - Order Summary */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Information</CardTitle>
                            <CardDescription>Course details and pricing</CardDescription>
                            <div className="relative w-full aspect-video rounded-md overflow-hidden">
                                <img
                                    className="rounded-md"
                                    src={`/api/download/${encodeURIComponent(course.imageUrl!)}`}
                                    alt={course?.title}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-2xl">{course.title}</h3>
                                <Preview value={course.description || "No description"} />
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Total Amount</span>
                                <span className="font-bold text-lg">{formatPrice(course.price!)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
