import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import client from '../api/client';
import { ResumeAnalysis } from '../types';
import ScoreCard from '../components/ScoreCard';
import KeywordTags from '../components/KeywordTags';
import SuggestionList from '../components/SuggestionList';
import { Calendar, ChevronDown, ChevronUp, Clock, FileText, Loader2, Award } from 'lucide-react';

const History: React.FC = () => {
  const [analyses, setAnalyses] = useState<ResumeAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { token } = useAuthStore();
  const navigate = useNavigate();

  // Route Protection: If not logged in, navigate to /login
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await client.get<ResumeAnalysis[]>('/history/');
      setAnalyses(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to retrieve search history. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchHistory();
    }
  }, [token]);

  const toggleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Helper to color code scores in small list indicators
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    if (score >= 40) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-brand-400 animate-spin mx-auto" />
          <p className="text-slate-400 font-semibold text-sm">Retrieving your analysis history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-12 space-y-8 relative min-h-[calc(100vh-80px)]">
      <div className="glow-spot top-10 left-10" />
      <div className="glow-spot bottom-10 right-10" />

      {/* Header */}
      <div className="space-y-2 relative z-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Analysis History</h1>
        <p className="text-slate-400 text-sm">Review your past resume uploads, ATS reports, and targeted adjustments.</p>
      </div>

      {/* Error Block */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium text-center relative z-10">
          ⚠️ {error}
        </div>
      )}

      {/* History Checklist */}
      <div className="space-y-4 relative z-10">
        {analyses.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4 max-w-xl mx-auto">
            <div className="mx-auto w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg">No saved analyses yet</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Upload and scan a resume while logged in, and your detailed scores and feedback histories will be persisted here!
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-brand-600/10 transition-colors"
            >
              Analyze Now
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-w-5xl mx-auto">
            {analyses.map((item) => {
              const isExpanded = expandedId === item.id;
              const result = item.analysis_json;

              return (
                <div
                  key={item.id}
                  className={`glass-panel rounded-2xl border transition-all overflow-hidden ${
                    isExpanded ? 'border-brand-500/30' : 'border-slate-850 hover:border-slate-750'
                  }`}
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => toggleExpand(item.id)}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-5 cursor-pointer select-none gap-4 hover:bg-slate-900/10"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-brand-400 flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-white font-bold text-base leading-snug">{item.filename}</h4>
                        <div className="flex items-center space-x-3 text-xs text-slate-400">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(item.created_at)}</span>
                          </span>
                          {result.jd_match_score !== null && result.jd_match_score !== undefined && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 text-[10px] font-semibold border border-brand-500/20">
                              JD MATCHED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                      {/* ATS Pill */}
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">ATS Score</span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getScoreColor(item.ats_score)}`}>
                          {item.ats_score}
                        </span>
                      </div>

                      {/* JD Match Pill */}
                      {result.jd_match_score !== null && result.jd_match_score !== undefined && (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">JD Match</span>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getScoreColor(result.jd_match_score)}`}>
                            {result.jd_match_score}%
                          </span>
                        </div>
                      )}

                      {/* Toggle Arrow */}
                      <div className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/40">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Dashboard */}
                  {isExpanded && (
                    <div className="p-6 border-t border-slate-850 bg-slate-950/20 space-y-8 animate-fadeIn">
                      {/* Metric cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ScoreCard
                          score={item.ats_score}
                          label="ATS Score"
                          subtitle="Calculated based on core format, keyword presence, and layout scan."
                        />

                        {result.jd_match_score !== null && result.jd_match_score !== undefined ? (
                          <ScoreCard
                            score={result.jd_match_score}
                            label="JD Match"
                            subtitle="Skill overlap index with the targeted job description requirements."
                          />
                        ) : (
                          <div className="glass-panel p-6 rounded-2xl border border-slate-850 flex flex-col justify-center items-center text-center text-slate-500 space-y-2 bg-slate-900/10">
                            <Clock className="w-8 h-8 text-slate-700" />
                            <h4 className="font-semibold text-slate-400 text-sm">No JD Matching</h4>
                            <p className="text-[11px] leading-relaxed max-w-[200px]">
                              Job description was not provided for this specific scan.
                            </p>
                          </div>
                        )}

                        <div className="glass-panel p-6 rounded-2xl border border-slate-850 flex flex-col justify-center space-y-4">
                          <h3 className="text-white font-bold text-base flex items-center space-x-2">
                            <Award className="w-5 h-5 text-brand-400" />
                            <span>AI Review Summary</span>
                          </h3>
                          <p className="text-slate-300 text-xs leading-relaxed font-medium">
                            {result.summary}
                          </p>
                        </div>
                      </div>

                      {/* Keywords */}
                      <KeywordTags
                        foundKeywords={result.found_keywords}
                        missingKeywords={result.missing_keywords}
                      />

                      {/* JD missing skills */}
                      {result.jd_missing_skills && result.jd_missing_skills.length > 0 && (
                        <div className="glass-panel border border-brand-500/10 p-6 rounded-2xl space-y-3 bg-slate-900/10">
                          <h3 className="text-brand-400 font-bold text-sm">Targeted JD Missing Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {result.jd_missing_skills.map((skill, index) => (
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

                      {/* Strengths & Weaknesses suggestions */}
                      <SuggestionList
                        strengths={result.strengths}
                        weaknesses={result.weaknesses}
                        suggestions={result.suggestions}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
