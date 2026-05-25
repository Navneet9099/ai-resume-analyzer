import React from 'react';
import { ArrowRight, HelpCircle, AlertCircle, Award } from 'lucide-react';

interface SuggestionListProps {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

const SuggestionList: React.FC<SuggestionListProps> = ({ strengths, weaknesses, suggestions }) => {
  return (
    <div className="space-y-6">
      {/* Strengths & Weaknesses side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-white font-bold text-base flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Award className="w-5 h-5 text-emerald-400" />
            <span>Top Core Strengths</span>
          </h3>
          <ul className="space-y-3">
            {strengths.map((str, i) => (
              <li key={i} className="flex items-start space-x-3 text-sm text-slate-300 leading-relaxed">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mt-0.5">
                  ✓
                </span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-white font-bold text-base flex items-center space-x-2 border-b border-slate-800 pb-3">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span>Identified Gaps & Vulnerabilities</span>
          </h3>
          <ul className="space-y-3">
            {weaknesses.map((weak, i) => (
              <li key={i} className="flex items-start space-x-3 text-sm text-slate-300 leading-relaxed">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs mt-0.5">
                  !
                </span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable Suggestions */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-white font-bold text-base flex items-center space-x-2 border-b border-slate-800 pb-3">
          <HelpCircle className="w-5 h-5 text-brand-400" />
          <span>Actionable ATS Optimization Plan</span>
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          {suggestions.map((sug, i) => (
            <div
              key={i}
              className="flex items-start space-x-4 p-4 rounded-xl bg-slate-900/40 border border-slate-850 hover:border-brand-500/20 transition-all group"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                  Recommendation #{i + 1}
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {sug}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 ml-auto self-center group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all hidden sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestionList;
