import React, { useState } from 'react';
import client from '../api/client';
import { ArrowLeftRight, Award, CheckCircle2, FileUp, Loader2, Sparkles, XCircle } from 'lucide-react';
import ScoreCard from '../components/ScoreCard';

const Compare: React.FC = () => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<any | null>(null);

  const handleFileChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile1(e.target.files[0]);
    }
  };

  const handleFileChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile2(e.target.files[0]);
    }
  };

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file1 || !file2) return;

    setIsLoading(true);
    setError(null);
    setComparison(null);

    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);

    try {
      const response = await client.post('/resume/compare', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setComparison(response.data);
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Failed to compare resumes. Please try again.';
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile1(null);
    setFile2(null);
    setComparison(null);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-12 space-y-8 relative min-h-[calc(100vh-80px)]">
      <div className="glow-spot top-10 left-10" />
      <div className="glow-spot bottom-10 right-10" />

      {/* Header */}
      <div className="space-y-2 relative z-10 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center space-x-2">
          <ArrowLeftRight className="w-8 h-8 text-brand-400" />
          <span>Side-by-Side Resume Comparison</span>
        </h1>
        <p className="text-slate-400 text-sm">Upload two distinct candidate profiles to compare their ATS readability indexes, strengths, and keywords overlap.</p>
      </div>

      {/* Compare Inputs */}
      {!comparison && (
        <form onSubmit={handleCompare} className="space-y-6 max-w-4xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resume A */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 text-center space-y-4 min-h-[220px] flex flex-col justify-center items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Resume Profile A</label>
              <div className="relative border border-dashed border-slate-800 bg-slate-950/40 rounded-2xl p-6 text-center cursor-pointer hover:border-slate-700 w-full flex-grow flex flex-col justify-center">
                <input type="file" accept=".pdf" required onChange={handleFileChange1} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <FileUp className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                <span className="text-xs text-slate-300 font-semibold">{file1 ? file1.name : "Upload PDF Resume A"}</span>
              </div>
            </div>

            {/* Resume B */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 text-center space-y-4 min-h-[220px] flex flex-col justify-center items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Resume Profile B</label>
              <div className="relative border border-dashed border-slate-800 bg-slate-950/40 rounded-2xl p-6 text-center cursor-pointer hover:border-slate-700 w-full flex-grow flex flex-col justify-center">
                <input type="file" accept=".pdf" required onChange={handleFileChange2} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <FileUp className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                <span className="text-xs text-slate-300 font-semibold">{file2 ? file2.name : "Upload PDF Resume B"}</span>
              </div>
            </div>
          </div>

          {error && <p className="text-rose-400 text-xs font-medium text-center">⚠️ {error}</p>}

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={isLoading || !file1 || !file2}
              className="w-full max-w-sm flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl font-semibold shadow-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white disabled:bg-slate-800 disabled:text-slate-500 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Double Scans...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Compare Resumes</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Comparison Results Dashboard */}
      {comparison && (
        <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto relative z-10">
          {/* Metadata Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
            <div>
              <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Active Comparison</p>
              <h2 className="text-slate-200 font-bold text-base">
                {file1?.name} <span className="text-brand-400">vs</span> {file2?.name}
              </h2>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
            >
              Start New Comparison
            </button>
          </div>

          {/* Winning Callout Badge */}
          <div className="glass-panel p-5 rounded-2xl border border-brand-500/20 bg-brand-500/5 text-center shadow-lg shadow-brand-500/5 animate-pulse max-w-xl mx-auto">
            <h3 className="text-sm font-extrabold text-brand-400 flex items-center justify-center space-x-1.5 uppercase tracking-wider">
              <Award className="w-5 h-5" />
              <span>
                {comparison.winner === 'resume1' ? file1?.name : file2?.name} takes the lead!
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              It scores <span className="text-brand-400 font-bold">{comparison.difference} points</span> higher on ATS optimization checks.
            </p>
          </div>

          {/* Scores side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative">
              {comparison.winner === 'resume1' && (
                <span className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-emerald-500 text-white font-extrabold text-[10px] tracking-wider uppercase z-20 shadow-md">
                  Winner
                </span>
              )}
              <ScoreCard score={comparison.resume1.ats_score} label={`${file1?.name} ATS Score`} />
            </div>

            <div className="relative">
              {comparison.winner === 'resume2' && (
                <span className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-emerald-500 text-white font-extrabold text-[10px] tracking-wider uppercase z-20 shadow-md">
                  Winner
                </span>
              )}
              <ScoreCard score={comparison.resume2.ats_score} label={`${file2?.name} ATS Score`} />
            </div>
          </div>

          {/* Strengths & Weaknesses side by side comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resume A Details */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-850 space-y-6">
              <h3 className="text-white font-extrabold text-sm border-b border-slate-800 pb-3 uppercase tracking-wider">
                {file1?.name} Analytical Details
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Strengths</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {comparison.resume1.strengths.map((s: string, i: number) => <li key={i}>&bull; {s}</li>)}
                  </ul>
                </div>
                
                <div className="space-y-2 pt-2 border-t border-slate-900">
                  <h4 className="text-xs font-bold text-orange-400 uppercase flex items-center space-x-1">
                    <XCircle className="w-4 h-4" />
                    <span>Vulnerabilities</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {comparison.resume1.weaknesses.map((w: string, i: number) => <li key={i}>&bull; {w}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            {/* Resume B Details */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-850 space-y-6">
              <h3 className="text-white font-extrabold text-sm border-b border-slate-800 pb-3 uppercase tracking-wider">
                {file2?.name} Analytical Details
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Strengths</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {comparison.resume2.strengths.map((s: string, i: number) => <li key={i}>&bull; {s}</li>)}
                  </ul>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-900">
                  <h4 className="text-xs font-bold text-orange-400 uppercase flex items-center space-x-1">
                    <XCircle className="w-4 h-4" />
                    <span>Vulnerabilities</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {comparison.resume2.weaknesses.map((w: string, i: number) => <li key={i}>&bull; {w}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compare;
