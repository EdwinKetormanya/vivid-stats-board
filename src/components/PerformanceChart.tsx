import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface PerformanceChartProps {
  data: Array<{
    subject: string;
    average: number;
    highest: number;
  }>;
}

export const PerformanceChart = ({ data }: PerformanceChartProps) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300">
      <h3 className="text-xl font-semibold text-foreground mb-6">Subject Performance Overview</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="subject" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--foreground))" }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--foreground))" }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))", 
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend />
          <Bar dataKey="average" fill="hsl(var(--primary))" name="Average Score" radius={[8, 8, 0, 0]} />
          <Bar dataKey="highest" fill="hsl(var(--accent))" name="Highest Score" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
