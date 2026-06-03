import React from 'react';
import { ClipboardList } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 border border-dashed border-card-border rounded-2xl bg-card/40 text-center gap-4 transition-all duration-300">
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-muted">
        <ClipboardList size={36} strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-lg text-foreground">No tasks found</h3>
        <p className="text-muted text-sm max-w-sm">
          No tasks match your filters, or you haven't created any tasks yet. Feel free to add a new task to get started!
        </p>
      </div>
    </div>
  );
};
