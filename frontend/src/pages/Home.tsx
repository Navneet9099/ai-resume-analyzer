import React, { useState } from 'react';
import client from '../api/client';
import { AnalysisResult } from '../types';
import UploadZone from '../components/UploadZone';
import ScoreCard from '../components/ScoreCard';
import KeywordTags from '../components/KeywordTags';
import SuggestionList from '../components/SuggestionList';
import { Award, BookOpen, BrainCircuit, RefreshCw, Sparkles, FileDown, Loader2 } from 'lucide-react';

const Home: React.FC = () => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedFile, setAnalyzedFile] = useState<string>('');

  // New Features States
  const [activeTab, setActiveTab] = useState<'resume' | 'linkedin'>('resume');
  const [linkedinText, setLinkedinText] = useState('');
  const [linkedinJd, setLinkedinJd] = useState('');
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  // Skill Gap Roadmap States
  const [targetRole, setTargetRole] = useState('');
  const [roadmap, setRoadmap] = useState<any[] | null>(null);
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);
  const [showRoleInput, setShowRoleInput] = useState(false);

  // Resume PDF Upload handler
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

  // LinkedIn Paste analyzer submission handler
  const handleLinkedInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedinText.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnalyzedFile('LinkedIn Profile Scan');

    try {
      const response = await client.post<AnalysisResult>('/resume/analyze-linkedin', {
        linkedin_text: linkedinText,
        job_description: linkedinJd.trim() ? linkedinJd : null
      });
      setAnalysis(response.data);
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || 'LinkedIn profile scan failed. Check connections and try again.';
      setError(detail);
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  // PDF Report Downloader
  const handleDownloadPDF = async () => {
    if (!analysis) return;
    setIsPdfLoading(true);
    try {
      const response = await client.post('/resume/download-report', analysis, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Resume_Analysis_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate and download PDF report.");
    } finally {
      setIsPdfLoading(false);
    }
  };

  // Skill Gap Roadmap Generative handler
  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim() || !analysis) return;
    setIsRoadmapLoading(true);
    try {
      const response = await client.post('/resume/skill-roadmap', {
        missing_keywords: analysis.missing_keywords,
        job_title: targetRole
      });
      setRoadmap(response.data.roadmap);
    } catch (err) {
      console.error(err);
      alert("Failed to compile Learning Roadmap.");
    } finally {
      setIsRoadmapLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setError(null);
    setAnalyzedFile('');
    setLinkedinText('');
    setLinkedinJd('');
    setTargetRole('');
    setRoadmap(null);
    setShowRoleInput(false);
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
            Upload your resume in PDF format or paste your LinkedIn bio, match against a job description, and get instant detailed critiques.
          </p>
        </div>
      )}

      {/* Tab Switcher (Only visible before scanning) */}
      {!analysis && (
        <div className="flex justify-center space-x-2 max-w-xs mx-auto mb-2 bg-slate-900/60 p-1 rounded-2xl border border-slate-850">
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex-grow py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'resume'
                ? 'bg-brand-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upload Resume
          </button>
          <button
            onClick={() => setActiveTab('linkedin')}
            className={`flex-grow py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'linkedin'
                ? 'bg-brand-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Paste LinkedIn
          </button>
        </div>
      )}

      {/* Main Form Area */}
      {!analysis && (
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
            {activeTab === 'resume' ? (
              <UploadZone onUpload={handleUpload} isLoading={isLoading} />
            ) : (
              <form onSubmit={handleLinkedInSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* LinkedIn Bio Textarea */}
                  <div className="rounded-2xl border border-slate-850 bg-slate-900/10 p-6 flex flex-col space-y-3 min-h-[300px]">
                    <label className="text-sm font-semibold tracking-wide text-slate-300">
                      LinkedIn About & Experience Text
                    </label>
                    <textarea
                      rows={8}
                      required
                      value={linkedinText}
                      onChange={(e) => setLinkedinText(e.target.value)}
                      disabled={isLoading}
                      placeholder="Paste your LinkedIn Profile text block here (About, Experience, Skills summaries) for instant scoring..."
                      className="w-full flex-grow rounded-xl bg-slate-950 border border-slate-850 p-4 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-brand-500 text-sm resize-none transition-all"
                    />
                  </div>

                  {/* Target JD */}
                  <div className="rounded-2xl border border-slate-850 bg-slate-900/10 p-6 flex flex-col space-y-3">
                    <label className="text-sm font-semibold tracking-wide text-slate-300">
                      Target Job Description (Optional)
                    </label>
                    <textarea
                      rows={8}
                      value={linkedinJd}
                      onChange={(e) => setLinkedinJd(e.target.value)}
                      disabled={isLoading}
                      placeholder="Paste the job description details here to analyze keyword matching..."
                      className="w-full flex-grow rounded-xl bg-slate-950 border border-slate-850 p-4 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-brand-500 text-sm resize-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  {isLoading ? (
                    <div className="glass-panel border border-brand-500/20 p-5 rounded-2xl max-w-lg w-full text-center space-y-3 shadow-lg animate-pulse">
                      <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
                      <p className="font-semibold text-brand-400 text-sm">Analyzing Profile...</p>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={!linkedinText.trim()}
                      className={`w-full max-w-sm flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl font-semibold shadow-xl transition-all ${
                        linkedinText.trim()
                          ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-brand-600/20 hover:from-brand-500 hover:to-indigo-500 hover:scale-[1.01]'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/20'
                      }`}
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Analyze Profile</span>
                    </button>
                  )}
                </div>
              </form>
            )}
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
            
            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              {/* PDF Download Button */}
              <button
                onClick={handleDownloadPDF}
                disabled={isPdfLoading}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-500 text-white shadow-md transition-all"
              >
                {isPdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                <span>{isPdfLoading ? 'Generating PDF...' : 'Download PDF Report'}</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Scan New</span>
              </button>
            </div>
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

          {/* Skill Gap Roadmap Generator (below keywords) */}
          {analysis.missing_keywords && analysis.missing_keywords.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-850 space-y-4 shadow-lg shadow-brand-500/5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-white font-bold text-base flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-brand-400" />
                    <span>Personalized Skill Gap Learning Roadmap</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Bridge technical gaps by generating a customized study roadmap with clickable free tutorials and time estimates.
                  </p>
                </div>

                {!showRoleInput && !roadmap && (
                  <button
                    onClick={() => setShowRoleInput(true)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md transition-all"
                  >
                    Generate Learning Roadmap
                  </button>
                )}
              </div>

              {/* Role targeting prompt */}
              {showRoleInput && !roadmap && (
                <form onSubmit={handleGenerateRoadmap} className="space-y-3 max-w-md animate-fadeIn">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">What role are you targeting?</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      required
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer, Full Stack Developer"
                      className="flex-grow rounded-xl bg-slate-950 border border-slate-850 p-3 text-slate-200 text-xs placeholder-slate-600 focus:outline-none focus:border-brand-500"
                      disabled={isRoadmapLoading}
                    />
                    <button
                      type="submit"
                      disabled={isRoadmapLoading || !targetRole.trim()}
                      className="px-5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center"
                    >
                      {isRoadmapLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Submit</span>}
                    </button>
                  </div>
                </form>
              )}

              {/* Roadmap cards display */}
              {roadmap && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-fadeIn">
                  {roadmap.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 hover:border-brand-500/20 transition-all flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-slate-200">{item.skill}</h4>
                          <span className="px-2 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.why}</p>
                      </div>
                      
                      <div className="pt-1">
                        <a
                          href={item.resource_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs font-semibold text-brand-400 hover:underline"
                        >
                          📚 Learn via {item.resource_name} →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
