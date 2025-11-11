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
  onConductChange: (learnerName: string, conduct: string) => void;
  onInterestChange: (learnerName: string, interest: string) => void;
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

const CONDUCT_OPTIONS = [
  "Excellent",
  "Very Good",
  "Good",
  "Satisfactory",
  "Fair",
  "Needs Improvement",
];

const INTEREST_OPTIONS = [
  "Sports",
  "Music",
  "Art",
  "Drama",
  "Reading",
  "Science",
  "Mathematics",
  "Technology",
  "Dance",
  "Leadership",
];

export const TeacherRemarksSelector = ({ learners, onRemarkChange, onConductChange, onInterestChange }: TeacherRemarksSelectorProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Class Teacher Remarks & Conduct</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Select remarks, conduct, and interest for each student. These will appear on their printed report card.
      </p>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {learners.map((learner, index) => (
            <div key={index} className="p-3 bg-muted/30 rounded-lg space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">{learner.name}</p>
                  <p className="text-xs text-muted-foreground">Position: {learner.position}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Teacher Remark</label>
                  <Select
                    value={learner.teacherRemark || ""}
                    onValueChange={(value) => onRemarkChange(learner.name, value)}
                  >
                    <SelectTrigger className="bg-background">
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

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Conduct</label>
                  <Select
                    value={learner.conduct || ""}
                    onValueChange={(value) => onConductChange(learner.name, value)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select conduct..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {CONDUCT_OPTIONS.map((conduct, idx) => (
                        <SelectItem key={idx} value={conduct} className="cursor-pointer">
                          {conduct}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Interest</label>
                  <Select
                    value={learner.interest || ""}
                    onValueChange={(value) => onInterestChange(learner.name, value)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select interest..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {INTEREST_OPTIONS.map((interest, idx) => (
                        <SelectItem key={idx} value={interest} className="cursor-pointer">
                          {interest}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
