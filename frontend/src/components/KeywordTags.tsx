import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface KeywordTagsProps {
  foundKeywords: string[];
  missingKeywords: string[];
}

const KeywordTags: React.FC<KeywordTagsProps> = ({ foundKeywords, missingKeywords }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Found Keywords */}
      <div className="glass-panel border border-emerald-500/10 p-6 rounded-2xl space-y-4">
        <h3 className="text-emerald-400 font-bold text-base flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>Found Keywords ({foundKeywords.length})</span>
        </h3>
        
        {foundKeywords.length === 0 ? (
          <p className="text-slate-500 text-sm">No major technical keywords detected in the resume.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {foundKeywords.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Missing Keywords */}
      <div className="glass-panel border border-rose-500/10 p-6 rounded-2xl space-y-4">
        <h3 className="text-rose-400 font-bold text-base flex items-center space-x-2">
          <XCircle className="w-5 h-5" />
          <span>Missing Keywords ({missingKeywords.length})</span>
        </h3>

        {missingKeywords.length === 0 ? (
          <p className="text-slate-500 text-sm">Excellent! No vital industry keywords appear to be missing.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-300"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordTags;
