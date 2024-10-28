import { useLocation } from "@remix-run/react";
import { BarChart, Book, Home, List, Search } from 'lucide-react';
import { SidebarItem } from "./sidebar-item";

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

function SidebarRoutes() {
    const { pathname } = useLocation();

    const isTeacherPage = pathname?.includes('/teacher');

    const Routes = isTeacherPage ? teacherRoutes : guestRoutes;

    return (
        <div className='flex flex-col w-full'>
            {Routes.map((route) => {
                return (
                    <SidebarItem
                        key={route.href}
                        href={route.href}
                        icon={route.icon}
                        label={route.label}
                    />
                )
            })}

        </div>
    )
}

export default SidebarRoutes

