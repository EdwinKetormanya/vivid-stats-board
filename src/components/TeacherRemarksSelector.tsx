import { LearnerScore } from "@/types/learner";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TeacherRemarksSelectorProps {
  learners: LearnerScore[];
  onRemarkChange: (learnerName: string, remark: string) => void;
}

const TEACHER_REMARKS = [
  "Excellent performance, keep it up!",
  "Very good work, continue the effort.",
  "Good progress shown this term.",
  "Satisfactory work, can do better.",
  "Fair performance, needs improvement.",
  "Needs to work harder and be more focused.",
  "Requires extra attention in weak subjects.",
  "Good conduct and attitude towards learning.",
  "Excellent attitude but needs academic improvement.",
  "Shows great potential, keep working hard.",
  "Improve class participation and homework submission.",
  "Needs to improve attendance and punctuality.",
  "Outstanding performance in all subjects.",
  "Consistent effort throughout the term.",
  "More practice needed in core subjects.",
];

export const TeacherRemarksSelector = ({ learners, onRemarkChange }: TeacherRemarksSelectorProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Class Teacher Remarks</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Select a remark for each student. This will appear on their printed report card.
      </p>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {learners.map((learner, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm">{learner.name}</p>
                <p className="text-xs text-muted-foreground">Position: {learner.position}</p>
              </div>
              <Select
                value={learner.teacherRemark || ""}
                onValueChange={(value) => onRemarkChange(learner.name, value)}
              >
                <SelectTrigger className="w-[300px] bg-background">
                  <SelectValue placeholder="Select remark..." />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {TEACHER_REMARKS.map((remark, idx) => (
                    <SelectItem key={idx} value={remark} className="cursor-pointer">
                      {remark}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
