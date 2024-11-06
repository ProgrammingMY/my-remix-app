import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"

export default function PurchaseStatusCard({ courseSlug }: { courseSlug: string }) {
    return (
        <>
            <CardHeader>
                <CardTitle className="mb-2">Checkout</CardTitle>
                <Separator />
            </CardHeader>
            <CardContent className="grid gap-y-4">
                <CardTitle>
                    You have successfully purchased the course
                </CardTitle>
                <CardDescription>
                    You can view the course here
                </CardDescription>
            </CardContent>
            <CardFooter>
                <a href={`/courses/${courseSlug}`} className="text-blue-500 hover:underline">
                    View Course
                </a>
            </CardFooter>
        </>
    )
}
