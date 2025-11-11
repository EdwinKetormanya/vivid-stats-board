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
