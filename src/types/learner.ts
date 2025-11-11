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
  teacherRemark?: string;
  conduct?: string;
  interest?: string;
  remarks?: {
    englishLanguage?: string;
    mathematics?: string;
    naturalScience?: string;
    history?: string;
    computing?: string;
    rme?: string;
    creativeArts?: string;
    owop?: string;
    ghanaianLanguage?: string;
    french?: string;
  };
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
