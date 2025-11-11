export interface LearnerScore {
  sn: number;
  name: string;
  englishLanguage: number;
  mathematics: number;
  naturalScience: number;
  history: number;
  computing: number;
  rme: number;
  creativeArts: number;
  owop: number;
  ghanaianLanguage: number;
  french: number;
  totalRawScore: number;
  position: string;
  averageScore: number;
}

export interface SubjectPerformance {
  subject: string;
  average: number;
  highest: number;
}

export interface DashboardStats {
  totalLearners: number;
  averageScore: number;
  topPerformer: string;
  lowestScore: number;
}
