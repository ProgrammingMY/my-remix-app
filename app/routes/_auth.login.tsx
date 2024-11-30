// app/routes/login.tsx
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, redirect, useActionData, useFetcher, useNavigate } from "@remix-run/react";
import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { isAuthenticated, login } from "~/utils/auth.server";

// First we create our UI with the form doing a POST and the inputs with the
// names we are going to use in the strategy
export default function Screen() {
    const data = useActionData<typeof action>();
    const { error } = data ?? {};
    const navigate = useNavigate();
    const fetcher = useFetcher();
    const isLoading = fetcher.state === "submitting" || fetcher.state === "loading";
    return (
        <>
            <Link
                to="/"
                className="py-2 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
                >
                    <polyline points="15 18 9 12 15 6" />
                </svg>{" "}
                Back
            </Link>
            <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Login</h1>
                <p className="text-balance text-muted-foreground">
                    Enter your email below to login to your account
                </p>
            </div>
            <fetcher.Form method="post">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="m@example.com"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>

                        </div>
                        <Input
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            required
                        />
                    </div>
                    {error ? <p className="text-red-600">{error.message}</p> : null}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="animate-spin" /> Logging in...</> : "Login"}
                    </Button>
                    <Button
                        className="w-full"
                        type="button"
                        variant={"outline"}
                        onClick={() => navigate("/api/login/google")}
                        disabled={isLoading}
                    >
                        Continue with Google
                    </Button>
                </div>
            </fetcher.Form>
            <div className="text-center">
                <Link
                    to="/forgot-password"
                    className="text-sm underline"
                >
                    Forgot your password?
                </Link>
                <div className="mt-4 text-sm">
                    Don&apos;t have an account?{" "}
                    <Link to="/signup" className="underline">
                        Sign up
                    </Link>
                </div>
            </div>
            {/* <div className="hidden bg-muted lg:block">
                <Image
                        src="/placeholder.svg"
                        alt="Image"
                        width="1920"
                        height="1080"
                        className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                    />
            </div> */}
        </>

    );
}

// Second, we need to export an action function, here we will use the
// `authenticator.authenticate method`
export async function action({ request, context }: ActionFunctionArgs) {
    const { env } = context.cloudflare;

    const { error, headers } = await login(request, env);

    if (error) {
        if (error.message === "Please verify your email") {
            return redirect("/verify", {
                headers
            });
        }
        return {
            error
        };
    }

    return redirect('/user', {
        headers,
    });
};

// Finally, we can export a loader function where we check if the user is
// authenticated with `authenticator.isAuthenticated` and redirect to the
// dashboard if it is or return null if it's not
export async function loader({ request, context }: LoaderFunctionArgs) {
    const { env } = context.cloudflare;

    const { user, headers } = await isAuthenticated(request, env);

    if (user && user.emailVerified) {
        return redirect("/user", {
            headers
        });
    }

    if (user && !user.emailVerified) {
        return redirect("/verify", {
            headers
        });
    }

    return null;
};