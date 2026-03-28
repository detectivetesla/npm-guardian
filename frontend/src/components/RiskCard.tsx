import { ShieldAlert, ShieldCheck, Activity, LucideIcon } from 'lucide-react';

interface RiskCardProps {
  title: string;
  value: string | number;
  trend?: string;
  status: 'success' | 'danger' | 'neutral';
  loading?: boolean;
}

export default function RiskCard({ title, value, trend, status, loading }: RiskCardProps) {
  const statusColors = {
    success: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
    danger: 'border-red-500/50 bg-red-500/10 text-red-400',
    neutral: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400',
  };

  const Icon: LucideIcon = status === 'success' ? ShieldCheck : status === 'danger' ? ShieldAlert : Activity;

  if (loading) {
    return (
      <div className={`p-6 rounded-xl border ${statusColors[status]} backdrop-blur-sm flex flex-col gap-4 animate-pulse`}>
        <div className="flex justify-between items-center">
          <div className="h-4 w-24 bg-zinc-700 rounded" />
          <div className="h-5 w-5 bg-zinc-700 rounded" />
        </div>
        <div className="flex items-baseline gap-2">
          <div className="h-9 w-20 bg-zinc-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl border ${statusColors[status]} backdrop-blur-sm flex flex-col gap-4 transition-all hover:scale-[1.02] hover:shadow-lg`}>
      <div className="flex justify-between items-center">
        <h3 className="text-zinc-300 font-medium">{title}</h3>
        <Icon size={20} className="opacity-80" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</span>
        {trend && <span className="text-sm opacity-70">{trend}</span>}
      </div>
    </div>
  );
}
