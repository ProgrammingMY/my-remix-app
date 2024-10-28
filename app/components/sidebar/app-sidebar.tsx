import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "~/components/ui/sidebar"

import { Link, useLocation } from "@remix-run/react";
import { BarChart, Book, Home, List, Search } from 'lucide-react';

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

    const isTeacherPage = pathname?.includes('/teacher');

    const items = isTeacherPage ? teacherRoutes : guestRoutes;



    return (
        <Sidebar variant="floating" collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Kelas Tech</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
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
