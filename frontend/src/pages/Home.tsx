import React, { useState } from 'react';
import client from '../api/client';
import { AnalysisResult } from '../types';
import UploadZone from '../components/UploadZone';
import ScoreCard from '../components/ScoreCard';
import KeywordTags from '../components/KeywordTags';
import SuggestionList from '../components/SuggestionList';
import { Award, BookOpen, BrainCircuit, RefreshCw, Sparkles } from 'lucide-react';

const Home: React.FC = () => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedFile, setAnalyzedFile] = useState<string>('');

  const handleUpload = async (file: File, jd: string) => {
    setIsLoading(true);
    setError(null);
    setAnalyzedFile(file.name);

    const formData = new FormData();
    formData.append('file', file);
    if (jd.trim()) {
      formData.append('job_description', jd);
    }

    try {
      const response = await client.post<AnalysisResult>('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAnalysis(response.data);
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || 'An unexpected error occurred while communicating with the server.';
      setError(detail);
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setError(null);
    setAnalyzedFile('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-12 space-y-12 relative min-h-[calc(100vh-80px)]">
      {/* Decorative Blur Backgrounds */}
      <div className="glow-spot top-10 left-10" />
      <div className="glow-spot bottom-10 right-10" />

      {/* Header Area */}
      {!analysis && (
        <div className="text-center max-w-2xl mx-auto space-y-4 pt-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-400 text-xs font-semibold uppercase tracking-wider">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>AI-Driven Resume Analysis</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Optimize Your Resume for <span className="bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">ATS Systems</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Upload your resume in PDF format, paste a job description, and get instant, detailed optimization feedback from Anthropic Claude.
          </p>
        </div>
      )}

      {/* Upload Zone */}
      {!analysis && (
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
            <UploadZone onUpload={handleUpload} isLoading={isLoading} />
          </div>
        </div>
      )}

      {/* Error Alert Box */}
      {error && (
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium text-center shadow-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Analysis Results Dashboard */}
      {analysis && (
        <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto relative z-10">
          {/* Dashboard Meta Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
            <div>
              <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Active Analysis</p>
              <h2 className="text-slate-200 font-bold text-lg">{analyzedFile}</h2>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Scan New Resume</span>
            </button>
          </div>

          {/* Scores Overview Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ATS Score Card */}
            <ScoreCard
              score={analysis.ats_score}
              label="ATS Score"
              subtitle={
                analysis.ats_score >= 80
                  ? 'Excellent. Your resume is extremely readable for modern scanners.'
                  : analysis.ats_score >= 60
                  ? 'Strong, but optimization gaps exist. Scan recommendations below.'
                  : 'Critical structural flaws. Needs immediate adjustment.'
              }
            />

            {/* Job Match Score Card (If JD was supplied) */}
            {analysis.jd_match_score !== null && analysis.jd_match_score !== undefined ? (
              <ScoreCard
                score={analysis.jd_match_score}
                label="Job Description Match"
                subtitle={
                  analysis.jd_match_score >= 80
                    ? 'Excellent keywords alignment. You match the requirements.'
                    : analysis.jd_match_score >= 60
                    ? 'Moderate skill overlap. Missing tags can be added below.'
                    : 'Low profile alignment. Tailor experiences to this description.'
                }
              />
            ) : (
              <div className="glass-panel p-6 rounded-2xl border border-slate-850 flex flex-col justify-center items-center text-center text-slate-500 space-y-2">
                <BookOpen className="w-8 h-8 text-slate-700" />
                <h4 className="font-semibold text-slate-400 text-sm">No JD Matching Provided</h4>
                <p className="text-xs leading-relaxed max-w-[200px]">
                  Paste a job description on your next scan to generate target keyword matching indexes.
                </p>
              </div>
            )}

            {/* AI Summary Card */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-850 flex flex-col justify-center space-y-4 col-span-1 md:col-span-2 lg:col-span-1 shadow-lg shadow-brand-500/5 bg-[radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.08)_0%,transparent_70%)] relative overflow-hidden">
              <div className="absolute top-4 right-4 text-brand-400/25">
                <Sparkles className="w-12 h-12" />
              </div>
              <h3 className="text-white font-bold text-base flex items-center space-x-2">
                <Award className="w-5 h-5 text-brand-400" />
                <span>AI Review Summary</span>
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                {analysis.summary}
              </p>
            </div>
          </div>

          {/* Keywords tags row */}
          <KeywordTags
            foundKeywords={analysis.found_keywords}
            missingKeywords={analysis.missing_keywords}
          />

          {/* JD Missing Skills Alert (if applicable) */}
          {analysis.jd_missing_skills && analysis.jd_missing_skills.length > 0 && (
            <div className="glass-panel border border-brand-500/10 p-6 rounded-2xl space-y-3">
              <h3 className="text-brand-400 font-bold text-base">
                💡 Targeted JD Missing Skills
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add these targeted skills to your resume to increase your chances of matching the job requirements:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {analysis.jd_missing_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-brand-500/10 border border-brand-500/25 text-brand-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Strengths, Weaknesses, Suggestions Deck */}
          <SuggestionList
            strengths={analysis.strengths}
            weaknesses={analysis.weaknesses}
            suggestions={analysis.suggestions}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
