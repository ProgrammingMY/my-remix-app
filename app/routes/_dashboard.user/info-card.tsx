import { IconBadge } from "~/components/icon-badge"
import { type LucideIcon } from "lucide-react";
import { Card } from "~/components/ui/card";

interface InfoCardProps {
    variant: "success" | "default";
    icon: LucideIcon;
    numberOfItems: number;
    label: string;
}

export const InfoCard = ({
    variant,
    icon: Icon,
    numberOfItems,
    label,
}: InfoCardProps) => {
    return (
        <Card className="border rounded-md flex items-center gap-x-2 p-3">
            <IconBadge
                variant={variant}
                icon={Icon}
            />
            <div>
                <p className="font-medium">
                    {label}
                </p>
                <p className="text-sm text-muted-foreground">
                    {numberOfItems} {numberOfItems === 1 ? "Course" : "Courses"}
                </p>
            </div>
        </Card>
    )
}
