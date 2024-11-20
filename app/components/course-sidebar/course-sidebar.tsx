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
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
} from "~/components/ui/sidebar"
import { CourseSidebarItem } from "./course-sidebar-item";
import { CheckCircle, PlayCircle, Lock, LogOutIcon } from "lucide-react";
import { Link, useLocation } from "@remix-run/react";
import { ChapterType, CourseType, PurchaseType, UserProgressType } from "~/db/schema.server";

interface CourseSidebarProps {
    course: CourseType & {
        chapters: (ChapterType & {
            userProgress: UserProgressType[] | null
        })[]
    };
    purchase: PurchaseType | undefined;
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
                            <CourseSidebarItem
                                key={chapter.id}
                                id={chapter.id}
                                label={chapter.title}
                                isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
                                courseSlug={course.slug}
                                isLocked={!chapter.isFree && !purchase}
                            />
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link to={"/user"}>
                            <SidebarMenuButton>
                                <LogOutIcon />
                                Exit Course
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}



export default CourseSidebar;