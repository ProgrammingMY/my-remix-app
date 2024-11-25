import { Link } from "@remix-run/react";
import { Button, buttonVariants } from "~/components/ui/button";


export default function Hero() {
    return (
        <section className="container grid mx-auto py-32 gap-y-10 px-4 md:px-0">
            <div className="text-center space-y-6">
                <main className="text-5xl md:text-6xl font-bold">
                    <h1 className="inline">
                        Unlock Malaysian
                    </h1>{" "}
                    <br />
                    <h2 className="inline">
                        <span className="inline bg-gradient-to-r from-[hsl(142,76%,36%)] to-[hsl(135,100%,50%)]  text-transparent bg-clip-text">
                            Tech Excellence, Together
                        </span>
                    </h2>
                </main>

                <p className="text-xl text-muted-foreground mx-auto ">
                    A platform for Malaysian tech enthusiasts to learn and teach together.
                </p>

                <div className="space-y-4 md:space-y-0 md:space-x-4">
                    <Link
                        to="/login"
                        className={`w-full md:w-1/3 border ${buttonVariants({ variant: "default" })}`} >
                        Get Started
                    </Link>
                </div>
            </div>
        </section >
    );
}
