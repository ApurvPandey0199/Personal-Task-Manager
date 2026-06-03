import React from 'react';
import { Task, TaskFilters } from '../types';
import { TaskItem } from './TaskItem';
import { useTasks } from '../hooks/useTasks';
import { EmptyState } from './EmptyState';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface TaskListProps {
  filters: TaskFilters;
  onEdit: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  filters,
  onEdit,
  onToggleComplete,
  onDelete
}) => {
  const { data: tasks, isLoading, error, refetch, isRefetching } = useTasks(filters);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-card-border/60 bg-card/40 animate-pulse"
          >
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="space-y-2 w-48 sm:w-64">
                <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
            <div className="h-8 w-20 rounded-lg bg-slate-200 dark:bg-slate-800 w-full sm:w-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-danger/20 rounded-2xl bg-danger-light/10 text-center gap-3">
        <AlertCircle size={32} className="text-danger" />
        <h3 className="font-bold text-lg text-foreground">Failed to load tasks</h3>
        <p className="text-muted text-sm max-w-sm">
          {error instanceof Error ? error.message : 'An unexpected network error occurred.'}
        </p>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-card-border bg-card hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw size={14} className={isRefetching ? 'animate-spin' : ''} />
          Retry
        </button>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEdit}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
