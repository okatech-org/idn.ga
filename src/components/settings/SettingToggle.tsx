import { Switch } from "@/components/ui/switch";
import { LucideIcon } from "lucide-react";

interface SettingToggleProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    iconColor?: string;
    iconBg?: string;
}

const SettingToggle = ({
    icon: Icon,
    title,
    description,
    checked,
    onCheckedChange,
    iconColor = "text-primary",
    iconBg = "neu-raised"
}: SettingToggleProps) => {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center space-x-4">
                {Icon && (
                    <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor}`}>
                        <Icon size={20} />
                    </div>
                )}
                <div>
                    <h3 className="font-medium text-sm text-foreground">{title}</h3>
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                </div>
            </div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    );
};

export default SettingToggle;
