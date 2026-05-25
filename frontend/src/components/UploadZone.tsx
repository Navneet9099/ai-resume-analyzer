import React, { useCallback, useState } from 'react';
import { FileDown, FileUp, Loader2, Sparkles, Terminal } from 'lucide-react';

interface UploadZoneProps {
  onUpload: (file: File, jd: string) => Promise<void>;
  isLoading: boolean;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onUpload, isLoading }) => {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Progressive loader texts
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 2 ? prev + 1 : prev));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const loadingTexts = [
    'Parsing PDF layout and extracting text with PyMuPDF...',
    'Consulting Anthropic Claude for deep analysis...',
    'Calculating ATS Score and compiling final feedback...'
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        alert('Please upload a PDF file.');
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onUpload(file, jd);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PDF Uploader */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative group rounded-2xl border-2 border-dashed p-8 text-center flex flex-col justify-center items-center cursor-pointer transition-all min-h-[300px] ${
            isDragActive
              ? 'border-brand-500 bg-brand-500/5'
              : file
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50'
          }`}
        >
          <input
            type="file"
            id="resume-file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={isLoading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {file ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                <FileDown className="w-8 h-8" />
              </div>
              <div>
                <p className="font-semibold text-lg text-slate-200">{file.name}</p>
                <p className="text-sm text-slate-400 mt-1">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Format ready
                </p>
              </div>
              <p className="text-xs text-brand-400 font-medium">Click or drag another to replace</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 text-brand-400 group-hover:scale-105 transition-transform">
                <FileUp className="w-8 h-8" />
              </div>
              <div>
                <p className="font-semibold text-lg text-slate-200">Drag & Drop Resume</p>
                <p className="text-sm text-slate-400 mt-1">Or click to search locally</p>
              </div>
              <p className="text-xs text-slate-500">Supports PDF format only</p>
            </div>
          )}
        </div>

        {/* Job Description Textarea */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col space-y-3">
          <label htmlFor="jd-input" className="text-sm font-semibold tracking-wide text-slate-300 flex items-center space-x-1">
            <Terminal className="w-4 h-4 text-brand-400" />
            <span>Target Job Description (Optional)</span>
          </label>
          <textarea
            id="jd-input"
            rows={8}
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            disabled={isLoading}
            placeholder="Paste the job description details here to analyze keyword matching and uncover direct structural gaps..."
            className="w-full flex-grow rounded-xl bg-slate-950 border border-slate-850 p-4 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm resize-none transition-all"
          />
        </div>
      </div>

      {/* Action / Loader */}
      <div className="flex justify-center pt-2">
        {isLoading ? (
          <div className="glass-panel border border-brand-500/20 p-5 rounded-2xl max-w-lg w-full text-center space-y-3 shadow-lg shadow-brand-500/5 animate-pulse">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
            <p className="font-semibold text-brand-400 text-sm">Analyzing Resume...</p>
            <p className="text-xs text-slate-400 transition-all duration-300 font-medium">
              {loadingTexts[loadingStep]}
            </p>
          </div>
        ) : (
          <button
            type="submit"
            disabled={!file}
            className={`w-full max-w-sm flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl font-semibold shadow-xl transition-all ${
              file
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-brand-600/20 hover:from-brand-500 hover:to-indigo-500 hover:scale-[1.01]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/20'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>Analyze Resume</span>
          </button>
        )}
      </div>
    </form>
  );
};

export default UploadZone;
