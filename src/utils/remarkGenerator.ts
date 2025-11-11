// Utility function to convert score to grade
export const getGrade = (score: number): string => {
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  if (score >= 40) return "E";
  if (score > 0) return "F";
  return "-";
};

// Utility function to convert score to BECE grade equivalent (1-9)
export const getBECEGrade = (score: number): number | string => {
  if (score >= 80) return 1; // Highest
  if (score >= 70) return 2; // Higher
  if (score >= 60) return 3; // High
  if (score >= 55) return 4; // High Average
  if (score >= 50) return 5; // Average
  if (score >= 45) return 6; // Low Average
  if (score >= 40) return 7; // Low
  if (score >= 35) return 8; // Lower
  if (score > 0) return 9; // Lowest
  return "-";
};

// Utility function to generate remarks based on score
export const generateRemark = (score: number): string => {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 50) return "Average";
  if (score >= 40) return "Below Average";
  if (score > 0) return "Needs Improvement";
  return "No Score";
};

export const generateSubjectRemarks = (learner: any) => {
  return {
    englishLanguage: generateRemark(learner.englishLanguage),
    mathematics: generateRemark(learner.mathematics),
    naturalScience: generateRemark(learner.naturalScience),
    history: generateRemark(learner.history),
    computing: generateRemark(learner.computing),
    rme: generateRemark(learner.rme),
    creativeArts: generateRemark(learner.creativeArts),
    owop: generateRemark(learner.owop),
    ghanaianLanguage: generateRemark(learner.ghanaianLanguage),
    french: generateRemark(learner.french),
  };
};
