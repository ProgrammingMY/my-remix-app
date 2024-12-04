import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
} from "~/components/ui/sidebar"

import { Link, useFetcher, useLocation, useNavigate } from "@remix-run/react";
import { BadgeCheck, BarChart, BookOpenTextIcon, ChevronsUpDown, Home, List, LogOut, Search, SidebarClose, Sparkles } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SafeUserType } from "~/lib/types";
import { capitalizeFirstLetter } from "~/lib/format";
import { isTeacher } from "~/lib/isTeacher";
import { ModeToggle } from "../toggle-theme";

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
    user: SafeUserType;
}) {
    const { pathname } = useLocation();
    const { state } = useSidebar();
    const navigate = useNavigate();
    const fetcher = useFetcher();

    const defaultPicUrl = "https://public.kelastech.com/default.png";

    const isTeacherPage = pathname?.includes('/teacher') && isTeacher(user);

    const items = isTeacherPage ? teacherRoutes : guestRoutes;

    const onLogout = async () => {
        fetcher.submit(null, {
            method: "POST",
            action: "/api/auth/logout",
        })
    }

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarHeader>
                        <img className="w-4/5 mx-auto py-2" src='/logo.png' alt="logo" />
                    </SidebarHeader>
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
                                    <SidebarMenuButton size={"lg"} className="px-6" isActive={pathname === item.href} asChild>
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
                                            src={user.imageUrl || defaultPicUrl}
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
                                                src={user.imageUrl || defaultPicUrl}
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
                                    {isTeacher(user) && (
                                        <Link to={isTeacherPage ? "/user" : "/teacher/courses"}>
                                            <DropdownMenuItem >
                                                <BookOpenTextIcon />
                                                {isTeacherPage ? "Change To Student Mode" : "Change To Teacher Mode"}
                                            </DropdownMenuItem>
                                        </Link>
                                    )}

                                </DropdownMenuGroup>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => navigate("/account")}>
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
