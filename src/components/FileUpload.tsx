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
      <label htmlFor="file-upload" className="flex items-center justify-center gap-3 p-4 cursor-pointer">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent/80 flex items-center justify-center shadow-lg">
          <Upload className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Upload Learner Scores</h3>
          <p className="text-xs text-muted-foreground">Excel or CSV file (.xlsx, .xls, .csv)</p>
        </div>
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
