import { Upload, Trash2, FileText } from 'lucide-react';
import { useState } from 'react';

interface UploadedFile {
  name: string;
  size: string;
  type: 'pdf' | 'word' | 'image' | 'other';
}

interface FileUploadCardProps {
  files?: UploadedFile[];
  acceptedFormats?: string;
  maxSize?: string;
}

export function FileUploadCard({
  files: initialFiles = [],
  acceptedFormats = 'PDF, WORD up to 1GB',
  maxSize,
}: FileUploadCardProps) {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [isDragging, setIsDragging] = useState(false);

  const typeColors = {
    pdf: { bg: 'bg-[#fee2e2]', icon: 'text-[#f32c2c]', label: 'PDF' },
    word: { bg: 'bg-[#dbeafe]', icon: 'text-[#3b82f6]', label: 'WORD' },
    image: { bg: 'bg-[#dcfce7]', icon: 'text-[#019364]', label: 'IMG' },
    other: { bg: 'bg-[#f5f5f5]', icon: 'text-[#737373]', label: 'FILE' },
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm">
      <h3 className="font-semibold text-[#171717] text-center mb-5">Upload Files</h3>

      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-5 ${
          isDragging
            ? 'border-[#ff5623] bg-[#ff5623]/5'
            : 'border-[#e5e5e5] bg-[#fafafa] hover:border-[#d4d4d4]'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
      >
        <Upload className="h-6 w-6 text-[#a3a3a3] mx-auto mb-2" />
        <p className="text-sm text-[#525252] font-medium">
          Drop file here or <span className="text-[#ff5623] cursor-pointer hover:underline">browse</span>
        </p>
        <p className="text-xs text-[#a3a3a3] mt-1">{acceptedFormats}</p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3 mb-5">
          {files.map((file, i) => {
            const tc = typeColors[file.type];
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#e5e5e5] hover:bg-[#fafafa] transition-colors">
                <div className={`w-10 h-10 rounded-lg ${tc.bg} flex items-center justify-center`}>
                  <span className={`text-[10px] font-bold ${tc.icon}`}>{tc.label}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#171717] truncate">{file.name}</p>
                  <p className="text-xs text-[#a3a3a3]">{file.size}</p>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="p-1.5 rounded-md hover:bg-[#fee2e2] transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-[#a3a3a3] hover:text-[#f32c2c]" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Button */}
      <button className="w-full py-3 rounded-xl bg-[#171717] text-white text-sm font-semibold hover:bg-[#262626] transition-colors">
        Upload
      </button>
    </div>
  );
}
