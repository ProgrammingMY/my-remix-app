import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
} from "~/components/ui/sidebar"

import { Link, useFetcher, useLocation } from "@remix-run/react";
import { BadgeCheck, BarChart, Bell, Book, BookOpenTextIcon, ChevronsUpDown, CreditCard, Home, List, LogOut, Search, Sparkles } from 'lucide-react';
import { cn } from "~/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { UserType } from "~/db/schema.server";
import { ClientUserType } from "~/lib/types";
import { capitalizeFirstLetter } from "~/lib/format";

const guestRoutes = [
    {
        href: "/user",
        label: "Dashboard",
        icon: Home,
    },
    {
        href: "/search",
        label: "Search",
        icon: Search,
    },
    {
        href: "/teacher/courses",
        label: "Teacher",
        icon: Book,
    }
]
const teacherRoutes = [
    {
        href: "/teacher/courses",
        label: "Courses",
        icon: List,
    },
    {
        href: "/teacher/analytics",
        label: "Analytics",
        icon: BarChart,
    }
]

export function AppSidebar({
    user
}: {
    user: ClientUserType;
}) {
    const { pathname } = useLocation();
    const { state } = useSidebar();
    const fetcher = useFetcher();

    const isTeacherPage = pathname?.includes('/teacher');

    const items = isTeacherPage ? teacherRoutes : guestRoutes;

    const onLogout = async () => {
        fetcher.submit(null, {
            method: "POST",
            action: "/api/auth/logout",
        })
    }

    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    {state === "expanded" && (
                        <div className="flex justify-between items-center">
                            <SidebarHeader className="text-lg font-medium line-clamp-1">KELAS TECH</SidebarHeader>
                            <SidebarTrigger />
                        </div>
                    )}
                    <SidebarSeparator />
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {state === "collapsed" && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <SidebarTrigger />
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
                            {items.map((item) => (
                                <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton asChild>
                                        <Link to={item.href}>
                                            <item.icon />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage
                                            src={"https://ui.shadcn.com/avatars/shadcn.jpg"}
                                            alt={user.name}
                                        />
                                        <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            {capitalizeFirstLetter(user.name)}
                                        </span>
                                        <span className="truncate text-xs">
                                            {user.email}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage
                                                src={"https://ui.shadcn.com/avatars/shadcn.jpg"}
                                                alt={user.name}
                                            />
                                            <AvatarFallback className="rounded-lg">
                                                CN
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">
                                                {capitalizeFirstLetter(user.name)}
                                            </span>
                                            <span className="truncate text-xs">
                                                {user.email}
                                            </span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <Sparkles />
                                        Upgrade to Pro
                                    </DropdownMenuItem>
                                    <Link to={isTeacherPage ? "/user" : "/teacher/courses"}>
                                        <DropdownMenuItem >
                                            <BookOpenTextIcon />
                                            {isTeacherPage ? "Change To Student Mode" : "Change To Teacher Mode"}
                                        </DropdownMenuItem>
                                    </Link>
                                </DropdownMenuGroup>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <BadgeCheck />
                                        Account
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={onLogout}>
                                    <LogOut />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
