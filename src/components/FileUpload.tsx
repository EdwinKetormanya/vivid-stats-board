import { Upload } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 hover:border-primary/50 transition-all duration-300">
      <label htmlFor="file-upload" className="flex flex-col items-center justify-center p-12 cursor-pointer">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent/80 flex items-center justify-center mb-4 shadow-lg">
          <Upload className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Upload Learner Scores</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          Drop your Excel or CSV file here, or click to browse
        </p>
        <p className="text-sm text-muted-foreground mt-2">Supported formats: .xlsx, .xls, .csv</p>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
        />
      </label>
    </Card>
  );
};
