import { cn } from "~/lib/utils";
import { CheckCircle, Lock, PlayCircle } from "lucide-react";
import { useLocation, useNavigate } from "@remix-run/react";

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
    const navigate = useNavigate();

    const onClick = () => {
        navigate(`/courses/${courseSlug}/chapters/${id}`);
    }
    return (
        <button
            onClick={onClick}
            type="button"
            className={cn(
                "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-500/20",
                isActive && "bg-slate-200/20 text-slate-700 hover:bg-slate-200/20 hover:text-slate-700",
                isCompleted && "text-emerald-700 hover:text-emerald-700",
                isCompleted && isActive && "bg-emerald-200/20",
            )}
        >
            <div className="flex items-center gap-x-2 py-4">
                <Icon
                    size={22}
                    className={cn(
                        "text-slate-500",
                        isActive && "text-slate-700",
                        isCompleted && "text-emerald-700",
                    )}
                />
                {label}
            </div>
            <div className={cn(
                "ml-auto opacity-0 border-2 border-slate-700 h-full transition-all",
                isActive && "opacity-100",
                isCompleted && "border-emerald-700",
            )} />
        </button>
    )
}
