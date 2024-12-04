import { cn } from "~/lib/utils";
import { CheckCircle, Lock, PlayCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "@remix-run/react";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

interface CourseSidebarItemProps {
    id: string;
    label: string;
    isCompleted: boolean;
    courseSlug: string;
    isLocked: boolean;
}

export const CourseSidebarItem = ({
    id,
    label,
    isCompleted,
    courseSlug,
    isLocked,
}: CourseSidebarItemProps) => {
    const Icon = isLocked ? Lock : (isCompleted ? CheckCircle : PlayCircle);
    const { pathname } = useLocation();
    const isActive = pathname?.includes(id);
    return (
        <SidebarMenuItem key={id}>
            <SidebarMenuButton
                asChild
                isActive={pathname?.includes(id)}
                size={"lg"}
            >
                <Link to={`/courses/${courseSlug}/chapters/${id}`} className="flex items-center">
                    <Icon
                        size={48}
                        className={cn(
                            "text-slate-500",
                            isActive && "text-slate-700",
                            isCompleted && "text-emerald-700",
                        )}
                    />
                    <span
                        className={cn(
                            "text-lg",
                            isCompleted && "text-emerald-700 hover:text-emerald-700",
                        )}>
                        {label}
                    </span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}
