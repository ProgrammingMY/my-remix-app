import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar,
} from "~/components/ui/sidebar"

import { Link, useFetcher, useLocation } from "@remix-run/react";
import { BadgeCheck, BarChart, Bell, Book, ChevronsUpDown, CreditCard, Home, List, LogOut, Search, Sparkles } from 'lucide-react';
import { cn } from "~/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

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

export function AppSidebar() {
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
        <Sidebar variant="floating" collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    {state === "expanded" && (
                        <div className="flex justify-between items-center">
                            <SidebarGroupLabel>Kelas Tech</SidebarGroupLabel>
                            <SidebarTrigger />
                        </div>
                    )}
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
                                            alt={"User Name"}
                                        />
                                        <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            {"User Name"}
                                        </span>
                                        <span className="truncate text-xs">
                                            {"User Email"}
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
                                                alt={"User Name"}
                                            />
                                            <AvatarFallback className="rounded-lg">
                                                CN
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">
                                                {"User Name"}
                                            </span>
                                            <span className="truncate text-xs">
                                                {"User Email"}
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
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <BadgeCheck />
                                        Account
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <CreditCard />
                                        Billing
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Bell />
                                        Notifications
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
