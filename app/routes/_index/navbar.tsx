import { useState } from "react";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "~/components/ui/navigation-menu";
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "~/components/ui/sheet";
import { buttonVariants } from "~/components/ui/button";
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
    const [isOpen, setIsOpen] = useState<boolean>(false);
    return (
        <header className="sticky border-b-[1px] top-0 z-40 w-full bg-white dark:border-b-slate-700 dark:bg-background">
            <NavigationMenu className="mx-auto">
                <NavigationMenuList className="container mx-auto h-14 px-4 w-screen flex justify-between ">
                    <NavigationMenuItem className="font-bold flex duration-200 lg:hover:scale-[1.10]">
                        <a
                            rel="noreferrer noopener"
                            href="/"
                            className="ml-2 "
                        >
                            <img className="h-10 w-auto" src='/logo.png' alt="logo" />
                        </a>
                    </NavigationMenuItem>

                    {/* mobile */}
                    <span className="flex md:hidden">

                        <Sheet
                            open={isOpen}
                            onOpenChange={setIsOpen}
                        >
                            <SheetTrigger className="px-2">
                                <Menu
                                    className="flex md:hidden h-5 w-5"
                                    onClick={() => setIsOpen(true)}
                                >
                                    <span className="sr-only">Menu Icon</span>
                                </Menu>
                            </SheetTrigger>

                            <SheetContent side={"right"}>
                                <SheetHeader>
                                    <SheetTitle className="font-bold text-xl">
                                        <img className="w-4/5 mx-auto" src='/logo.png' alt="logo" />
                                    </SheetTitle>
                                </SheetHeader>
                                <nav className="flex flex-col justify-center items-center gap-2 mt-4">
                                    {routeList.map(({ href, label }: RouteProps) => (
                                        <a
                                            rel="noreferrer noopener"
                                            key={label}
                                            href={href}
                                            onClick={() => setIsOpen(false)}
                                            className={buttonVariants({ variant: "ghost" })}
                                        >
                                            {label}
                                        </a>
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
                    <nav className="hidden md:flex gap-2">
                        {routeList.map((route: RouteProps, i) => (
                            <a
                                rel="noreferrer noopener"
                                href={route.href}
                                key={i}
                                className={`text-[17px] ${buttonVariants({
                                    variant: "ghost",
                                })}`}
                            >
                                {route.label}
                            </a>
                        ))}
                    </nav>

                    <div className="hidden md:flex gap-2">
                        <Link
                            to="/login"
                            className={`border ${buttonVariants({ variant: "default" })}`}
                        >
                            Sign In
                        </Link>
                    </div>
                </NavigationMenuList>
            </NavigationMenu>
        </header>
    )
}
