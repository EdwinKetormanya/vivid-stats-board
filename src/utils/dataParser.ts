import * as XLSX from "xlsx";
import { LearnerScore, SubjectPerformance, DashboardStats } from "@/types/learner";

const getNum = (row: any, candidates: string[]): number => {
  const keyMap = new Map(
    Object.keys(row).map((k) => [k.toLowerCase().trim(), k])
  );
  for (const name of candidates) {
    const key = keyMap.get(String(name).toLowerCase().trim());
    if (key) {
      const val = parseFloat(row[key]);
      if (!isNaN(val)) return val;
    }
  }
  return 0;
};

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
            naturalScience: getNum(row, ["NATURAL SCIENCE","SCIENCE","INTEGRATED SCIENCE","NS"]),
            history: parseFloat(row["HISTORY"]) || 0,
            computing: parseFloat(row["COMPUTING"]) || 0,
            rme: parseFloat(row["RME"]) || 0,
            creativeArts: getNum(row, ["CREATIVE ARTS","CREATIVE ART","ART","VISUAL ARTS"]),
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
    { key: "creativeArts", name: "Creative Arts" },
    { key: "owop", name: "OWOP" },
    { key: "ghanaianLanguage", name: "Ghanaian Lang" },
    { key: "french", name: "French" },
  ];
  
  return subjects.map(({ key, name }) => {
    const scores = learners.map((l) => {
      const v = l[key as keyof LearnerScore] as number;
      return Number.isFinite(v) ? v : 0;
    });
    const average = scores.length > 0 
      ? scores.reduce((a, b) => a + b, 0) / scores.length 
      : 0;
    const highest = scores.length > 0 ? Math.max(...scores) : 0;
    
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
