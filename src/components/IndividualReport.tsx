import { LearnerScore } from "@/types/learner";
import { Card } from "@/components/ui/card";
import { getGrade, getBECEGrade } from "@/utils/remarkGenerator";
import { format } from "date-fns";

interface IndividualReportProps {
  learner: LearnerScore;
  classAverage: number;
}

export const IndividualReport = ({ learner, classAverage }: IndividualReportProps) => {
  const subjects = [
    { label: "English Language", value: learner.englishLanguage, key: "englishLanguage" as const },
    { label: "Mathematics", value: learner.mathematics, key: "mathematics" as const },
    { label: "Natural Science", value: learner.naturalScience, key: "naturalScience" as const },
    { label: "History", value: learner.history, key: "history" as const },
    { label: "Computing", value: learner.computing, key: "computing" as const },
    { label: "RME", value: learner.rme, key: "rme" as const },
    { label: "Creative Arts", value: learner.creativeArts, key: "creativeArts" as const },
    { label: "OWOP", value: learner.owop, key: "owop" as const },
    { label: "Ghanaian Language", value: learner.ghanaianLanguage, key: "ghanaianLanguage" as const },
    { label: "French", value: learner.french, key: "french" as const },
  ];

  return (
    <div className="print-page bg-white text-black p-6 min-h-[297mm] max-w-[210mm] mx-auto flex flex-col">
      {/* Inner border within printable area */}
      <div className="border-2 border-gray-800 p-3 flex flex-col flex-1">
      {/* Header with Logo */}
      <div className="relative mb-2 border-b-2 border-gray-800 pb-2">
        <div className="flex items-start gap-3">
          {learner.schoolLogo && (
            <div className="flex-shrink-0">
              <img 
                src={learner.schoolLogo} 
                alt="School Logo" 
                className="h-16 w-16 object-contain block school-logo-print"
                style={{ 
                  printColorAdjust: 'exact', 
                  WebkitPrintColorAdjust: 'exact'
                }}
              />
            </div>
          )}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold mb-1">Student Performance Report</h1>
            {(learner.schoolName || learner.district || learner.region) && (
              <div className="text-xs text-gray-600 mb-1">
                {learner.schoolName && <div className="font-semibold">{learner.schoolName}</div>}
                {learner.district && learner.region && (
                  <div>{learner.district}, {learner.region}</div>
                )}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
              <div><span className="font-semibold">Term:</span> {learner.term || "Not Set"}</div>
              <div><span className="font-semibold">Year:</span> {learner.year || "Not Set"}</div>
              <div><span className="font-semibold">No. on Roll:</span> {learner.numberOnRoll || "Not Set"}</div>
            </div>
            {(learner.vacationDate || learner.reopeningDate) && (
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-1">
                <div><span className="font-semibold">Vacation:</span> {learner.vacationDate ? format(learner.vacationDate, "PPP") : "Not Set"}</div>
                <div><span className="font-semibold">Reopening:</span> {learner.reopeningDate ? format(learner.reopeningDate, "PPP") : "Not Set"}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Information */}
      <div className="mb-2">
        <Card className="p-2 bg-gray-50 border-2 border-gray-300">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs font-semibold text-gray-600">Student Name</p>
              <p className="text-base font-bold">{learner.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Position</p>
              <p className="text-base font-bold">{learner.position}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Total Score</p>
              <p className="text-base font-bold">{learner.totalRawScore}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Average Score</p>
              <p className="text-base font-bold">{learner.averageScore.toFixed(2)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Subject Scores */}
      <div className="mb-2 flex-1">
        <h2 className="text-xs font-bold mb-1 border-b border-gray-400 pb-0.5">Subject Performance</h2>
        <div className="space-y-0.5">
          {subjects.map((subject, index) => (
            <div 
              key={index} 
              className="grid grid-cols-[1fr_auto_auto_auto_1fr] gap-4 items-center p-1 bg-gray-50 border border-gray-300 rounded text-xs"
            >
              <span className="font-medium text-xs">{subject.label}</span>
              <span className="font-bold text-xs text-center w-10">{subject.value || 0}</span>
              <span className="font-bold text-xs text-center w-10 bg-primary text-white rounded px-1">
                {getGrade(subject.value)}
              </span>
              <span className="font-bold text-xs text-center w-10 bg-secondary text-secondary-foreground rounded px-1">
                {getBECEGrade(subject.value)}
              </span>
              <span className="text-gray-600 italic text-right text-xs">
                {learner.remarks?.[subject.key] || "No Score"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mb-2">
        <Card className="p-2 bg-gray-50 border-2 border-gray-300">
          <h3 className="text-xs font-bold mb-1.5">Performance Summary</h3>
          <div className="space-y-0.5 text-xs">
            <div className="flex justify-between">
              <span>Student Average:</span>
              <span className="font-bold">{learner.averageScore.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Class Average:</span>
              <span className="font-bold">{classAverage.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Total Aggregate:</span>
              <span className="font-bold">{learner.totalAggregate}</span>
            </div>
            <div className="flex justify-between">
              <span>Performance vs Class:</span>
              <span className={`font-bold ${
                learner.averageScore >= classAverage ? "text-green-600" : "text-orange-600"
              }`}>
                {learner.averageScore >= classAverage ? "Above Average" : "Below Average"}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Conduct, Interest, Attendance, and Status */}
      <div className="mb-2">
        <Card className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200">
          <h3 className="text-xs font-bold mb-2 text-indigo-900 border-b border-indigo-200 pb-1">Student Assessment</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-lg p-2 border border-indigo-100 shadow-sm">
              <p className="text-xs font-semibold text-indigo-600 mb-1 uppercase tracking-wide">Conduct</p>
              <p className="text-sm font-bold text-gray-800">{learner.conduct || "Not Set"}</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-indigo-100 shadow-sm">
              <p className="text-xs font-semibold text-indigo-600 mb-1 uppercase tracking-wide">Interest</p>
              <p className="text-sm font-bold text-gray-800">{learner.interest || "Not Set"}</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-indigo-100 shadow-sm">
              <p className="text-xs font-semibold text-indigo-600 mb-1 uppercase tracking-wide">Attendance</p>
              <p className="text-sm font-bold text-gray-800">
                {learner.attendance !== undefined 
                  ? `${learner.attendance}${learner.attendanceOutOf ? ` / ${learner.attendanceOutOf}` : ''}`
                  : "Not Set"}
              </p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-indigo-100 shadow-sm">
              <p className="text-xs font-semibold text-indigo-600 mb-1 uppercase tracking-wide">Promotion Status</p>
              <p className="text-sm font-bold text-gray-800">{learner.status || "Not Set"}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Class Teacher Remark */}
      {learner.teacherRemark && (
        <div className="mb-2">
          <Card className="p-2 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
            <h3 className="text-xs font-bold mb-1.5 text-amber-900 border-b border-amber-200 pb-1">Class Teacher&apos;s Remark</h3>
            <p className="text-xs leading-relaxed text-gray-800 bg-white rounded-lg p-2 border border-amber-100">{learner.teacherRemark}</p>
          </Card>
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t-2 border-gray-300 mt-auto">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="mb-2 text-xs">Class Teacher&apos;s Signature:</p>
            <div className="border-b-2 border-gray-400 w-32"></div>
          </div>
          <div>
            <p className="mb-2 text-xs">Headteacher&apos;s Signature:</p>
            <div className="border-b-2 border-gray-400 w-32"></div>
          </div>
          <div>
            <p className="mb-2 text-xs">Date:</p>
            <div className="border-b-2 border-gray-400 w-32"></div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
