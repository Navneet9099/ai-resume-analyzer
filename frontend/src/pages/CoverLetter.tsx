import React, { useState } from 'react';
import client from '../api/client';
import { Clipboard, Download, FileUp, Loader2, Sparkles, Terminal } from 'lucide-react';

const CoverLetter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jd, setJd] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !jobTitle.trim() || !companyName.trim() || !jd.trim()) return;

    setIsLoading(true);
    setError(null);
    setCoverLetter(null);
    setCopied(false);

    try {
      // Step 1: Extract text from PDF using the upload parser logic
      const formData = new FormData();
      formData.append('file', file);
      
      // We can use a quick custom text extraction route or use our existing upload
      // Since upload returns the analysis, let's create a quick text extractor or
      // pass file and params. Let's do a direct file upload to a helper, or
      // let the backend handle the full extraction. Since we configured /resume/cover-letter
      // to accept JSON, we can fetch the text first by uploading the PDF to a utility endpoint,
      // or we can make a multipart request. To keep the API simple, we'll upload the PDF to /resume/upload
      // to get the text, or we can use a quick text extraction route!
      // Let's call /resume/upload anonymously to get the analysis, and from its keywords/summary
      // we can extract text, or let's create a dedicated text-extraction endpoint!
      // Wait, let's check: our /resume/upload returns AnalysisResult, not raw text.
      // Let's create a small endpoint in backend/app/routers/resume.py: POST /resume/extract
      // that returns {"text": str}. That is extremely useful!
      
      // Let's upload file to get text
      const extractFormData = new FormData();
      extractFormData.append('file', file);
      
      // We will add an endpoint /resume/extract in the backend to return plain extracted text!
      // Let's write this page first, then we'll add the /resume/extract route to resume.py.
      const textResponse = await client.post<{ text: string }>('/resume/extract', extractFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const resumeText = textResponse.data.text;

      // Step 2: Generate cover letter using the extracted text
      const clResponse = await client.post<{ cover_letter: string }>('/resume/cover-letter', {
        resume_text: resumeText,
        job_description: jd,
        company_name: companyName,
        job_title: jobTitle
      });

      setCoverLetter(clResponse.data.cover_letter);
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Failed to generate cover letter. Please verify details.';
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!coverLetter) return;
    const element = document.createElement("a");
    const fileBlob = new Blob([coverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `Cover_Letter_${companyName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 md:py-12 space-y-8 relative min-h-[calc(100vh-80px)]">
      <div className="glow-spot top-10 left-10" />
      <div className="glow-spot bottom-10 right-10" />

      {/* Header */}
      <div className="space-y-2 relative z-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Cover Letter Generator</h1>
        <p className="text-slate-400 text-sm">Generate a customized, professional three-paragraph cover letter tailored directly to a job description.</p>
      </div>

      {/* Form and Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 items-start">
        {/* Form Container */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <h3 className="text-white font-bold text-base flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <span>Generation Details</span>
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* File Upload */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Upload Resume PDF</label>
              <div className="relative border border-dashed border-slate-800 bg-slate-950/40 rounded-xl p-4 text-center cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  required
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileUp className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                <span className="text-xs text-slate-400 font-semibold block">
                  {file ? file.name : "Drag or select your PDF Resume"}
                </span>
              </div>
            </div>

            {/* Inputs Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Role</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="w-full rounded-xl bg-slate-950 border border-slate-850 p-3 text-slate-200 text-xs placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full rounded-xl bg-slate-950 border border-slate-850 p-3 text-slate-200 text-xs placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* JD Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Job Description</label>
              <textarea
                rows={6}
                required
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the target job description details here to extract keywords and align cover letter tone..."
                className="w-full rounded-xl bg-slate-950 border border-slate-850 p-3 text-slate-200 text-xs placeholder-slate-600 focus:outline-none focus:border-brand-500 resize-none transition-all"
              />
            </div>

            {error && (
              <p className="text-rose-400 text-xs font-medium text-center">⚠️ {error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading || !file}
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-slate-850 disabled:text-slate-500 text-white font-semibold shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing & Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Cover Letter</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Preview Container */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 min-h-[480px] flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-white font-bold text-base flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-brand-400" />
                <span>Generated Cover Letter</span>
              </span>
              
              {coverLetter && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Copy to Clipboard"
                  >
                    <Clipboard className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Download as TXT"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </h3>

            {coverLetter ? (
              <div className="whitespace-pre-line text-slate-300 text-sm leading-relaxed max-h-[380px] overflow-y-auto pr-2 animate-fadeIn font-medium">
                {coverLetter}
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-slate-500 text-sm font-medium border border-dashed border-slate-850 rounded-xl">
                {isLoading ? "Writing cover letter using Groq Llama-3.3..." : "Your generated cover letter will appear here."}
              </div>
            )}
          </div>

          {copied && (
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center animate-pulse mt-4">
              ✓ Successfully copied to clipboard!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoverLetter;
