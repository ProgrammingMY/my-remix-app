import { Chapter, Course, Purchase, UserProgress } from "@prisma/client";
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
import { CourseSidebarItem } from "./course-sidebar-item";

interface CourseSidebarProps {
    course: Course & {
        chapters: (Chapter & {
            userProgress: UserProgress[] | null
        })[]
    };
    purchase: Purchase | null
};

const CourseSidebar = ({ course, purchase }: CourseSidebarProps) => {
    const { state } = useSidebar();
    return (
        <Sidebar variant="floating" collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    {state === "expanded" && (
                        <div className="flex justify-between items-center">
                            <SidebarGroupLabel>{course.title}</SidebarGroupLabel>
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
                            {course.chapters.map((chapter) => (
                                <SidebarMenuItem key={chapter.id}>
                                    <SidebarMenuButton asChild>
                                        <CourseSidebarItem
                                            key={chapter.id}
                                            id={chapter.id}
                                            label={chapter.title}
                                            isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
                                            courseSlug={course.slug}
                                            isLocked={!chapter.isFree && !purchase}
                                        />
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



export default CourseSidebar;