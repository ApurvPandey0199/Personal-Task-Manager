import React from 'react';
import { useTaskStats } from '../hooks/useTasks';
import { ListTodo, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const StatsBar: React.FC = () => {
  const { data: stats, isLoading, error } = useTaskStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="p-5 border border-card-border/60 bg-card/40 rounded-2xl shadow-sm animate-pulse h-24"
          />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return null; // Don't show stats if there's an error
  }

  const statItems = [
    {
      label: 'Total Tasks',
      value: stats.total,
      icon: <ListTodo size={20} className="text-blue-500" />,
      bg: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: <CheckCircle2 size={20} className="text-success" />,
      bg: 'bg-success-light dark:bg-emerald-950/20'
    },
    {
      label: 'Active',
      value: stats.pending,
      icon: <Clock size={20} className="text-warning" />,
      bg: 'bg-warning-light dark:bg-amber-950/20'
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: <AlertTriangle size={20} className="text-danger" />,
      bg: 'bg-danger-light dark:bg-red-950/20',
      highlight: stats.overdue > 0
    }
  ];

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-4 p-4 border rounded-2xl bg-card/80 backdrop-blur-md shadow-sm transition-all duration-300 ${
              item.highlight
                ? 'border-danger/30 ring-1 ring-danger/10'
                : 'border-card-border'
            }`}
          >
            <div className={`p-3 rounded-xl ${item.bg} shrink-0`}>
              {item.icon}
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-muted text-xs font-semibold uppercase tracking-wider truncate">
                {item.label}
              </p>
              <h3 className="text-2xl font-bold text-foreground truncate">
                {item.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="p-4 border border-card-border bg-card/85 backdrop-blur-md rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-foreground">Completion Rate</span>
          <span className="text-sm font-bold text-primary">{stats.completionRate}%</span>
        </div>
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};
