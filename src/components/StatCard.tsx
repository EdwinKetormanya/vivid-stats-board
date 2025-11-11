import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: "primary" | "accent" | "success";
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const gradientClasses = {
  primary: "from-primary to-blue-500",
  accent: "from-accent to-orange-500",
  success: "from-success to-emerald-500",
};

export const StatCard = ({ title, value, icon: Icon, gradient, trend }: StatCardProps) => {
  return (
    <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-foreground mb-2">{value}</h3>
            {trend && (
              <p className={`text-sm ${trend.isPositive ? "text-success" : "text-destructive"}`}>
                {trend.value}
              </p>
            )}
          </div>
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradientClasses[gradient]} flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
      <div className={`h-1 bg-gradient-to-r ${gradientClasses[gradient]}`} />
    </Card>
  );
};
