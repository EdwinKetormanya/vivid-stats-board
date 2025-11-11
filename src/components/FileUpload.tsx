import { Upload } from "lucide-react";

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
    <label 
      htmlFor="file-upload" 
      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors text-sm font-medium"
    >
      <Upload className="w-4 h-4" />
      Upload Learner Scores (.xlsx, .xls, .csv)
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
      />
    </label>
  );
};
