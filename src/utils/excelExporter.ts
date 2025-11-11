import * as XLSX from 'xlsx';
import { LearnerScore } from '@/types/learner';

export const exportToExcel = (learners: LearnerScore[], fileName: string = 'learner-reports.xlsx') => {
  // Prepare data for export
  const exportData = learners.map((learner) => ({
    'S/N': learner.sn,
    'Name': learner.name,
    'English Language': learner.englishLanguage,
    'Mathematics': learner.mathematics,
    'Natural Science': learner.naturalScience,
    'History': learner.history,
    'Computing': learner.computing,
    'RME': learner.rme,
    'Creative Arts': learner.creativeArts,
    'OWOP': learner.owop,
    'Ghanaian Language': learner.ghanaianLanguage,
    'French': learner.french,
    'Total Raw Score': learner.totalRawScore,
    'Average Score (%)': learner.averageScore.toFixed(2),
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
    { wch: 12 }, // Mathematics
    { wch: 15 }, // Natural Science
    { wch: 10 }, // History
    { wch: 12 }, // Computing
    { wch: 8 },  // RME
    { wch: 15 }, // Creative Arts
    { wch: 8 },  // OWOP
    { wch: 18 }, // Ghanaian Language
    { wch: 10 }, // French
    { wch: 15 }, // Total Raw Score
    { wch: 15 }, // Average Score
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
