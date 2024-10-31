import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar,
} from "~/components/ui/sidebar"

import { Link, useLocation } from "@remix-run/react";
import { BarChart, Book, Home, List, Search } from 'lucide-react';
import { cn } from "~/lib/utils";

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

    const isTeacherPage = pathname?.includes('/teacher');

    const items = isTeacherPage ? teacherRoutes : guestRoutes;



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
        </Sidebar>
    )
}
