import * as XLSX from 'xlsx';
import { LearnerScore } from '@/types/learner';
import { getGrade, getBECEGrade } from './remarkGenerator';

export const exportToExcel = (learners: LearnerScore[], fileName: string = 'learner-reports.xlsx') => {
  // Prepare data for export
  const exportData = learners.map((learner) => ({
    'S/N': learner.sn,
    'Name': learner.name,
    'English Language': learner.englishLanguage,
    'ENG Grade': getGrade(learner.englishLanguage),
    'ENG Equiv': getBECEGrade(learner.englishLanguage),
    'Mathematics': learner.mathematics,
    'MATH Grade': getGrade(learner.mathematics),
    'MATH Equiv': getBECEGrade(learner.mathematics),
    'Natural Science': learner.naturalScience,
    'SCI Grade': getGrade(learner.naturalScience),
    'SCI Equiv': getBECEGrade(learner.naturalScience),
    'History': learner.history,
    'HIST Grade': getGrade(learner.history),
    'HIST Equiv': getBECEGrade(learner.history),
    'Computing': learner.computing,
    'COMP Grade': getGrade(learner.computing),
    'COMP Equiv': getBECEGrade(learner.computing),
    'RME': learner.rme,
    'RME Grade': getGrade(learner.rme),
    'RME Equiv': getBECEGrade(learner.rme),
    'Creative Arts': learner.creativeArts,
    'ART Grade': getGrade(learner.creativeArts),
    'ART Equiv': getBECEGrade(learner.creativeArts),
    'OWOP': learner.owop,
    'OWOP Grade': getGrade(learner.owop),
    'OWOP Equiv': getBECEGrade(learner.owop),
    'Ghanaian Language': learner.ghanaianLanguage,
    'GHA Grade': getGrade(learner.ghanaianLanguage),
    'GHA Equiv': getBECEGrade(learner.ghanaianLanguage),
    'French': learner.french,
    'FRE Grade': getGrade(learner.french),
    'FRE Equiv': getBECEGrade(learner.french),
    'Total Raw Score': learner.totalRawScore,
    'Average Score (%)': learner.averageScore.toFixed(2),
    'Total Aggregate': learner.totalAggregate,
    'Position': learner.position,
    'Teacher Remark': learner.teacherRemark || '',
    'Conduct': learner.conduct || '',
    'Interest': learner.interest || '',
    'Term': learner.term || '',
    'Year': learner.year || '',
    'No. on Roll': learner.numberOnRoll || '',
    'Region': learner.region || '',
    'District': learner.district || '',
    'School Name': learner.schoolName || '',
    'Vacation Date': learner.vacationDate ? new Date(learner.vacationDate).toLocaleDateString() : '',
    'Reopening Date': learner.reopeningDate ? new Date(learner.reopeningDate).toLocaleDateString() : '',
  }));

  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);
  
  // Set column widths for better readability
  const columnWidths = [
    { wch: 5 },  // S/N
    { wch: 25 }, // Name
    { wch: 12 }, // English Language
    { wch: 8 },  // ENG Grade
    { wch: 8 },  // ENG Equiv
    { wch: 12 }, // Mathematics
    { wch: 8 },  // MATH Grade
    { wch: 8 },  // MATH Equiv
    { wch: 15 }, // Natural Science
    { wch: 8 },  // SCI Grade
    { wch: 8 },  // SCI Equiv
    { wch: 10 }, // History
    { wch: 8 },  // HIST Grade
    { wch: 8 },  // HIST Equiv
    { wch: 12 }, // Computing
    { wch: 8 },  // COMP Grade
    { wch: 8 },  // COMP Equiv
    { wch: 8 },  // RME
    { wch: 8 },  // RME Grade
    { wch: 8 },  // RME Equiv
    { wch: 15 }, // Creative Arts
    { wch: 8 },  // ART Grade
    { wch: 8 },  // ART Equiv
    { wch: 8 },  // OWOP
    { wch: 8 },  // OWOP Grade
    { wch: 8 },  // OWOP Equiv
    { wch: 18 }, // Ghanaian Language
    { wch: 8 },  // GHA Grade
    { wch: 8 },  // GHA Equiv
    { wch: 10 }, // French
    { wch: 8 },  // FRE Grade
    { wch: 8 },  // FRE Equiv
    { wch: 15 }, // Total Raw Score
    { wch: 15 }, // Average Score
    { wch: 15 }, // Total Aggregate
    { wch: 10 }, // Position
    { wch: 40 }, // Teacher Remark
    { wch: 15 }, // Conduct
    { wch: 15 }, // Interest
    { wch: 10 }, // Term
    { wch: 10 }, // Year
    { wch: 12 }, // No. on Roll
    { wch: 18 }, // Region
    { wch: 25 }, // District
    { wch: 30 }, // School Name
    { wch: 15 }, // Vacation Date
    { wch: 15 }, // Reopening Date
  ];
  ws['!cols'] = columnWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Student Reports');
  
  // Generate file and trigger download
  XLSX.writeFile(wb, fileName);
};
