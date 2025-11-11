import { LearnerScore } from "@/types/learner";
import { IndividualReport } from "./IndividualReport";

interface PrintReportsProps {
  learners: LearnerScore[];
  classAverage: number;
}

export const PrintReports = ({ learners, classAverage }: PrintReportsProps) => {
  return (
    <div className="print-container">
      {learners.map((learner, index) => (
        <div key={index} className="page-break">
          <IndividualReport learner={learner} classAverage={classAverage} />
        </div>
      ))}
    </div>
  );
};
