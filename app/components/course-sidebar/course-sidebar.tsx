import { Chapter, Course, Purchase, UserProgress } from "@prisma/client";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
} from "~/components/ui/sidebar"
import { CourseSidebarItem } from "./course-sidebar-item";
import { CheckCircle, PlayCircle, Lock } from "lucide-react";
import { Link, useLocation } from "@remix-run/react";

interface CourseSidebarProps {
    course: Course & {
        chapters: (Chapter & {
            userProgress: UserProgress[] | null
        })[]
    };
    purchase: Purchase | null
};

const CourseSidebar = ({ course, purchase }: CourseSidebarProps) => {
    const { pathname } = useLocation();
    return (
        <Sidebar variant="inset" collapsible="offcanvas">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarHeader className="text-lg font-medium line-clamp-1">{course.title}</SidebarHeader>
                    <SidebarSeparator />
                    <SidebarMenu>
                        {course.chapters.map((chapter) => (
                            <SidebarMenuItem key={chapter.id}>
                                <SidebarMenuButton asChild isActive={pathname?.includes(chapter.id)}>
                                    <Link to={`/courses/${course.slug}/chapters/${chapter.id}`}>
                                        <PlayCircle />
                                        <span>{chapter.title}</span>
                                    </Link>
                                    {/* <CourseSidebarItem
                                            key={chapter.id}
                                            id={chapter.id}
                                            label={chapter.title}
                                            isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
                                            courseSlug={course.slug}
                                            isLocked={!chapter.isFree && !purchase}
                                        /> */}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}



export default CourseSidebar;