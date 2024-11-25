import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "~/components/ui/navigation-menu";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "~/components/ui/sheet";
import { Button, buttonVariants } from "~/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "@remix-run/react";

interface RouteProps {
    href: string;
    label: string;
}

const routeList: RouteProps[] = [
    {
        href: "#features",
        label: "Features",
    },
    {
        href: "#faq",
        label: "FAQ",
    },
    {
        href: "#about",
        label: "About",
    },
];

export default function Navbar() {
    return (
        <header className="fixed border-b-[1px] top-0 z-40 w-full bg-white dark:border-b-slate-700 dark:bg-background">
            <div className="w-full">
                <div className="relative h-14 px-4 w-full flex justify-between items-center">
                    <div className="font-bold flex duration-200 lg:hover:scale-[1.10] absolute left-4">
                        <a
                            rel="noreferrer noopener"
                            href="/"
                            className="ml-2 "
                        >
                            <img className="h-10 w-auto" src='/logo.png' alt="logo" />
                        </a>
                    </div>

                    {/* mobile */}
                    <span className="flex md:hidden absolute right-4">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost">
                                    <Menu className="flex md:hidden h-5 w-5" />
                                    <span className="sr-only">Menu Icon</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side={"right"}>
                                <SheetDescription className="hidden">
                                    Menu
                                </SheetDescription>
                                <SheetHeader>
                                    <SheetTitle className="font-bold text-xl">
                                        <img className="w-4/5 mx-auto" src='/logo.png' alt="logo" />
                                    </SheetTitle>
                                </SheetHeader>
                                <nav className="flex flex-col justify-center items-center gap-2 mt-4">
                                    {routeList.map(({ href, label }: RouteProps) => (
                                        <SheetClose asChild key={label}>
                                            <Link
                                                rel="noreferrer noopener"
                                                to={href}
                                                className={buttonVariants({ variant: "ghost" })}
                                            >
                                                {label}
                                            </Link>
                                        </SheetClose>
                                    ))}
                                </nav>
                                <SheetFooter>
                                    <Link
                                        to="/login"
                                        className={`border ${buttonVariants({ variant: "default" })}`}
                                    >
                                        Sign In
                                    </Link>
                                </SheetFooter>
                            </SheetContent>

                        </Sheet>
                    </span>

                    {/* desktop */}
                    <nav className="hidden md:flex gap-2 mx-auto">
                        {routeList.map((route: RouteProps, i) => (
                            <Link
                                rel="noreferrer noopener"
                                to={route.href}
                                key={i}
                                className={`text-[17px] ${buttonVariants({
                                    variant: "ghost",
                                })}`}
                            >
                                {route.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="hidden md:flex gap-2 absolute right-4">
                        <Link
                            to="/login"
                            className={`border ${buttonVariants({ variant: "default" })}`}
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    )
}
