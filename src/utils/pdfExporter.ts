import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { LearnerScore } from "@/types/learner";

export const exportIndividualPDF = async (
  learner: LearnerScore,
  classAverage: number
): Promise<void> => {
  // Find the report card element in the print area
  const reportCards = document.querySelectorAll(".print-page");
  const learnerIndex = Array.from(document.querySelectorAll(".print-page")).findIndex(
    (card) => card.textContent?.includes(learner.name)
  );

  if (learnerIndex === -1 || !reportCards[learnerIndex]) {
    throw new Error("Report card not found");
  }

  const reportCard = reportCards[learnerIndex] as HTMLElement;

  try {
    const canvas = await html2canvas(reportCard, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`${learner.name}-report-card.pdf`);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
};

export const exportMultiplePDF = async (
  learners: LearnerScore[],
  classAverage: number,
  fileName: string = "report-cards.pdf"
): Promise<void> => {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const reportCards = document.querySelectorAll(".print-page");
    
    for (let i = 0; i < reportCards.length; i++) {
      const reportCard = reportCards[i] as HTMLElement;
      
      const canvas = await html2canvas(reportCard, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    }

    pdf.save(fileName);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
};
