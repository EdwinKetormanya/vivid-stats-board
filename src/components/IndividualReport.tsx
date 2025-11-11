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
    <div className="print-page bg-white text-black p-8 min-h-[297mm]">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
        <h1 className="text-3xl font-bold mb-2">Student Performance Report</h1>
        <p className="text-sm text-gray-600">Academic Year 2024/2025</p>
      </div>

      {/* Student Information */}
      <div className="mb-8">
        <Card className="p-6 bg-gray-50 border-2 border-gray-300">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">Student Name</p>
              <p className="text-xl font-bold">{learner.name}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Position</p>
              <p className="text-xl font-bold">{learner.position}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Total Score</p>
              <p className="text-xl font-bold">{learner.totalRawScore}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Average Score</p>
              <p className="text-xl font-bold">{learner.averageScore.toFixed(2)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Subject Scores */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 border-b border-gray-400 pb-2">Subject Performance</h2>
        <div className="space-y-2">
          {subjects.map((subject, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center p-3 bg-gray-50 border border-gray-300 rounded"
            >
              <span className="font-medium">{subject.label}</span>
              <span className="font-bold text-lg">{subject.value || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mt-8">
        <Card className="p-6 bg-gray-50 border-2 border-gray-300">
          <h3 className="text-lg font-bold mb-4">Performance Summary</h3>
          <div className="space-y-2">
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
      <div className="mt-12 pt-8 border-t-2 border-gray-300">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="mb-2">Teacher&apos;s Signature:</p>
            <div className="border-b-2 border-gray-400 w-48"></div>
          </div>
          <div>
            <p className="mb-2">Date:</p>
            <div className="border-b-2 border-gray-400 w-48"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
