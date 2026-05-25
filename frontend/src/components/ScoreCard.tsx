import React from 'react';

interface ScoreCardProps {
  score: number;
  label: string;
  subtitle?: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ score, label, subtitle }) => {
  // Determine color scheme based on score thresholds
  const getColorScheme = (val: number) => {
    if (val >= 80) return {
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-500/5',
      radial: 'stroke-emerald-400',
      track: 'stroke-emerald-950/40',
      shadow: 'shadow-emerald-500/10'
    };
    if (val >= 60) return {
      text: 'text-yellow-400',
      border: 'border-yellow-500/20',
      bg: 'bg-yellow-500/5',
      radial: 'stroke-yellow-400',
      track: 'stroke-yellow-950/40',
      shadow: 'shadow-yellow-500/10'
    };
    if (val >= 40) return {
      text: 'text-orange-400',
      border: 'border-orange-500/20',
      bg: 'bg-orange-500/5',
      radial: 'stroke-orange-400',
      track: 'stroke-orange-950/40',
      shadow: 'shadow-orange-500/10'
    };
    return {
      text: 'text-rose-400',
      border: 'border-rose-500/20',
      bg: 'bg-rose-500/5',
      radial: 'stroke-rose-400',
      track: 'stroke-rose-950/40',
      shadow: 'shadow-rose-500/10'
    };
  };

  const colors = getColorScheme(score);
  const strokeDashoffset = 251.2 - (251.2 * score) / 100;

  return (
    <div className={`glass-panel border ${colors.border} ${colors.bg} ${colors.shadow} p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group`}>
      {/* Light glow behind circle */}
      <div className="absolute -inset-10 opacity-30 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

      <h3 className="text-slate-400 text-sm font-semibold tracking-wider uppercase mb-4">{label}</h3>

      {/* Radial Gauge */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            className={`${colors.track}`}
            strokeWidth="8"
            fill="transparent"
          />
          {/* Fill circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            className={`${colors.radial} transition-all duration-1000 ease-out`}
            strokeWidth="8"
            strokeDasharray="251.2"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Inner core displaying digits */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold ${colors.text} tracking-tight`}>{score}</span>
          <span className="text-slate-500 text-xs font-semibold uppercase mt-0.5">/ 100</span>
        </div>
      </div>

      {subtitle && (
        <p className="text-slate-300 text-sm mt-4 leading-relaxed font-medium max-w-[200px]">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default ScoreCard;
