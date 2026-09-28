import React from 'react';
import { Award, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function AttendanceStatusBadge({ status, showDescription = false, size = 'default' }) {
  const getStatusConfig = () => {
    switch (status) {
      case '90% ACHIEVED':
        return {
          icon: Award,
          label: '90% ACHIEVED',
          badgeClass: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300 ring-1 ring-cyan-500/20',
          dotClass: 'bg-cyan-400',
          textClass: 'text-cyan-400',
          description: 'Currently meets or exceeds the 90% distinction benchmark.'
        };
      case 'SAFE':
        return {
          icon: CheckCircle,
          label: 'SAFE',
          badgeClass: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-500/20',
          dotClass: 'bg-emerald-400',
          textClass: 'text-emerald-400',
          description: 'Attendance satisfies the mandatory 75% minimum compliance threshold.'
        };
      case 'DETENTION RISK':
        return {
          icon: AlertTriangle,
          label: 'DETENTION RISK',
          badgeClass: 'bg-amber-950/80 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/20',
          dotClass: 'bg-amber-400 animate-pulse',
          textClass: 'text-amber-400',
          description: 'Currently below 75%. Detention risk active, but recovery is mathematically achievable.'
        };
      case 'IRREVERSIBLE DETENTION':
        return {
          icon: XCircle,
          label: 'IRREVERSIBLE DETENTION',
          badgeClass: 'bg-rose-950/80 border-rose-500/40 text-rose-300 ring-1 ring-rose-500/20',
          dotClass: 'bg-rose-400',
          textClass: 'text-rose-400',
          description: 'Cannot reach 75% even with 100% attendance in all remaining classes.'
        };
      default:
        return {
          icon: CheckCircle,
          label: status || 'UNKNOWN',
          badgeClass: 'bg-slate-800 border-slate-700 text-slate-300',
          dotClass: 'bg-slate-400',
          textClass: 'text-slate-400',
          description: ''
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const isLarge = size === 'large';

  return (
    <div className="inline-flex flex-col">
      <div className={`inline-flex items-center space-x-1.5 rounded-md border font-mono font-medium ${config.badgeClass} ${
        isLarge ? 'px-3 py-1.5 text-xs' : 'px-2 py-0.5 text-[11px]'
      }`}>
        <span className={`w-2 h-2 rounded-full ${config.dotClass}`}></span>
        <Icon className={isLarge ? 'w-4 h-4' : 'w-3 h-3'} />
        <span>{config.label}</span>
      </div>
      {showDescription && (
        <p className="mt-1.5 text-xs text-slate-400 font-sans leading-relaxed">
          {config.description}
        </p>
      )}
    </div>
  );
}
