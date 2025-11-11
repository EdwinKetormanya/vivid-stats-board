import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface LearnerData {
  name: string;
  position: string;
  totalScore: number;
  averageScore: number;
}

interface LeaderboardTableProps {
  learners: LearnerData[];
}

export const LeaderboardTable = ({ learners }: LeaderboardTableProps) => {
  const getPositionColor = (position: string) => {
    const pos = String(position || "");
    if (pos.includes("1st")) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    if (pos.includes("2nd")) return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
    if (pos.includes("3rd")) return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">Top Performers</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Learner Name</TableHead>
              <TableHead className="text-right">Total Score</TableHead>
              <TableHead className="text-right">Average Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {learners.map((learner, index) => (
              <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                  <Badge className={getPositionColor(learner.position)}>
                    {learner.position}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{learner.name}</TableCell>
                <TableCell className="text-right font-semibold">{learner.totalScore}</TableCell>
                <TableCell className="text-right">
                  <span className="text-primary font-semibold">{learner.averageScore.toFixed(2)}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
