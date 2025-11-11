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
      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-md font-medium hover:shadow-lg transition-all duration-300 cursor-pointer"
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
