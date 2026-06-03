import React from 'react';
import { TaskFilters } from '../types';
import { Plus } from 'lucide-react';

interface FilterBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  onAddTaskClick: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onAddTaskClick
}) => {
  const handleStatusChange = (status: 'all' | 'pending' | 'completed') => {
    onChange({
      ...filters,
      status: status === 'all' ? '' : status
    });
  };

  const currentStatus = filters.status || 'all';

  return (
    <div className="flex flex-row items-center justify-between gap-4 p-4 border border-card-border bg-card/80 backdrop-blur-md rounded-2xl shadow-sm mb-6">
      {/* Filter Options & Action Button */}
      <div className="flex items-center justify-between w-full gap-4">
        {/* Status Pill Selectors */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {(['all', 'pending', 'completed'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusChange(status)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                currentStatus === status
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {status === 'pending' ? 'active' : status}
            </button>
          ))}
        </div>

        {/* Add Task Button */}
        <button
          type="button"
          onClick={onAddTaskClick}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-primary hover:bg-primary-hover shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
};
