import * as XLSX from "xlsx";
import { LearnerScore, SubjectPerformance, DashboardStats } from "@/types/learner";

export const parseExcelFile = (file: File): Promise<LearnerScore[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const learners: LearnerScore[] = jsonData
          .map((row: any) => ({
            sn: row["S/N"] || 0,
            name: row["NAME OF LEARNER"] || "",
            englishLanguage: parseFloat(row["ENGLISH LANGUAGE"]) || 0,
            mathematics: parseFloat(row["MATHEMATICS"]) || 0,
            naturalScience: parseFloat(row["NATURAL SCIENCE"]) || 0,
            history: parseFloat(row["HISTORY"]) || 0,
            computing: parseFloat(row["COMPUTING"]) || 0,
            rme: parseFloat(row["RME"]) || 0,
            creativeArts: parseFloat(row["CREATIVE ARTS"]) || 0,
            owop: parseFloat(row["OWOP"]) || 0,
            ghanaianLanguage: parseFloat(row["GHANAIAN LANGUAGE"]) || 0,
            french: parseFloat(row["FRENCH"]) || 0,
            totalRawScore: parseFloat(row["TOTAL RAW SCORE"]) || 0,
            position: row["POSITION"] || "",
            averageScore: parseFloat(row["AVERAGE SCORE"]) || 0,
          }))
          .filter((learner) => learner.name && learner.totalRawScore > 0);
        
        resolve(learners);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsBinaryString(file);
  });
};

export const calculateSubjectPerformance = (learners: LearnerScore[]): SubjectPerformance[] => {
  if (learners.length === 0) return [];
  
  const subjects = [
    { key: "englishLanguage", name: "English" },
    { key: "mathematics", name: "Mathematics" },
    { key: "naturalScience", name: "Science" },
    { key: "history", name: "History" },
    { key: "computing", name: "Computing" },
    { key: "rme", name: "RME" },
    { key: "creativeArts", name: "Arts" },
    { key: "owop", name: "OWOP" },
    { key: "ghanaianLanguage", name: "Ghanaian Lang" },
    { key: "french", name: "French" },
  ];
  
  return subjects.map(({ key, name }) => {
    const scores = learners.map((l) => l[key as keyof LearnerScore] as number);
    const validScores = scores.filter((s) => s > 0);
    const average = validScores.length > 0 
      ? validScores.reduce((a, b) => a + b, 0) / validScores.length 
      : 0;
    const highest = validScores.length > 0 ? Math.max(...validScores) : 0;
    
    return {
      subject: name,
      average: parseFloat(average.toFixed(2)),
      highest,
    };
  });
};

export const calculateDashboardStats = (learners: LearnerScore[]): DashboardStats => {
  if (learners.length === 0) {
    return {
      totalLearners: 0,
      averageScore: 0,
      topPerformer: "N/A",
      lowestScore: 0,
    };
  }
  
  const totalAverage = learners.reduce((sum, l) => sum + l.averageScore, 0) / learners.length;
  const topLearner = learners.reduce((top, current) => 
    current.totalRawScore > top.totalRawScore ? current : top
  );
  const lowestScore = Math.min(...learners.map((l) => l.totalRawScore));
  
  return {
    totalLearners: learners.length,
    averageScore: parseFloat(totalAverage.toFixed(2)),
    topPerformer: topLearner.name,
    lowestScore,
  };
};
