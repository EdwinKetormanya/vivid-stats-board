import { LearnerScore } from "@/types/learner";
import { Card } from "@/components/ui/card";

interface IndividualReportProps {
  learner: LearnerScore;
  classAverage: number;
}

export const IndividualReport = ({ learner, classAverage }: IndividualReportProps) => {
  const subjects = [
    { label: "English Language", value: learner.englishLanguage },
    { label: "Mathematics", value: learner.mathematics },
    { label: "Natural Science", value: learner.naturalScience },
    { label: "History", value: learner.history },
    { label: "Computing", value: learner.computing },
    { label: "RME", value: learner.rme },
    { label: "Creative Arts", value: learner.creativeArts },
    { label: "OWOP", value: learner.owop },
    { label: "Ghanaian Language", value: learner.ghanaianLanguage },
    { label: "French", value: learner.french },
  ];

  return (
    <div className="print-page bg-white text-black p-12 h-[297mm] w-[210mm] flex flex-col">
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-gray-800 pb-3">
        <h1 className="text-2xl font-bold mb-1">Student Performance Report</h1>
        <p className="text-xs text-gray-600">Academic Year 2024/2025</p>
      </div>

      {/* Student Information */}
      <div className="mb-5">
        <Card className="p-4 bg-gray-50 border-2 border-gray-300">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-gray-600">Student Name</p>
              <p className="text-lg font-bold">{learner.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Position</p>
              <p className="text-lg font-bold">{learner.position}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Total Score</p>
              <p className="text-lg font-bold">{learner.totalRawScore}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Average Score</p>
              <p className="text-lg font-bold">{learner.averageScore.toFixed(2)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Subject Scores */}
      <div className="mb-5 flex-1">
        <h2 className="text-base font-bold mb-3 border-b border-gray-400 pb-1">Subject Performance</h2>
        <div className="space-y-1.5">
          {subjects.map((subject, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center p-2 bg-gray-50 border border-gray-300 rounded"
            >
              <span className="font-medium text-sm">{subject.label}</span>
              <span className="font-bold text-base">{subject.value || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mb-5">
        <Card className="p-4 bg-gray-50 border-2 border-gray-300">
          <h3 className="text-sm font-bold mb-3">Performance Summary</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span>Student Average:</span>
              <span className="font-bold">{learner.averageScore.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Class Average:</span>
              <span className="font-bold">{classAverage.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Performance vs Class:</span>
              <span className={`font-bold ${
                learner.averageScore > classAverage ? "text-green-600" : "text-red-600"
              }`}>
                {learner.averageScore > classAverage ? "Above" : "Below"} Average
                ({(learner.averageScore - classAverage).toFixed(2)}%)
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="pt-5 border-t-2 border-gray-300 mt-auto">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="mb-2 text-sm">Teacher&apos;s Signature:</p>
            <div className="border-b-2 border-gray-400 w-40"></div>
          </div>
          <div>
            <p className="mb-2 text-sm">Date:</p>
            <div className="border-b-2 border-gray-400 w-40"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
