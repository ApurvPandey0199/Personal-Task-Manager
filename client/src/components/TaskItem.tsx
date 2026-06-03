import React from 'react';
import { Task } from '../types';
import { Pencil, Trash2, Calendar, Check, AlertCircle } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onEdit,
  onToggleComplete,
  onDelete
}) => {
  const isOverdue =
    !task.completed &&
    task.due_date &&
    task.due_date < new Date().toISOString().split('T')[0];

  const formattedDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  return (
    <div
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-300 ${
        task.completed
          ? 'bg-slate-50/50 dark:bg-slate-900/20 border-card-border/60 opacity-75'
          : isOverdue
          ? 'bg-red-500/5 dark:bg-red-950/10 border-red-500/80 dark:border-red-800/80 shadow-sm hover:shadow-md'
          : 'bg-card/70 border-card-border hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox to Toggle Complete */}
        <label
          htmlFor={`task-complete-${task.id}`}
          className={`relative flex items-center justify-center h-6 w-6 rounded-full border cursor-pointer select-none mt-0.5 transition-all ${
            task.completed
              ? 'bg-primary border-primary text-white'
              : 'border-card-border hover:border-primary bg-transparent text-transparent'
          }`}
        >
          <input
            id={`task-complete-${task.id}`}
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(task)}
            className="sr-only"
          />
          <Check size={14} strokeWidth={3} className={task.completed ? 'block' : 'hidden'} />
        </label>

        {/* Task Text Details */}
        <div className="space-y-1">
          <h3
            className={`font-semibold text-base transition-all break-all flex items-center gap-2 ${
              task.completed
                ? 'line-through text-muted/60 decoration-slate-400'
                : 'text-foreground'
            }`}
          >
            {isOverdue && <AlertCircle size={16} className="text-red-500 shrink-0" />}
            {task.title}
          </h3>
          
          {task.description && (
            <p
              className={`text-sm break-words line-clamp-2 max-w-xl ${
                task.completed ? 'text-muted/50' : 'text-muted'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Date Tag */}
          {task.due_date && (
            <div className="flex items-center gap-1.5 pt-1 text-xs">
              <span
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium ${
                  task.completed
                    ? 'bg-slate-100 dark:bg-slate-800 text-muted/60'
                    : isOverdue
                    ? 'bg-danger-light text-danger dark:bg-red-950/20 dark:text-red-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-muted'
                }`}
              >
                {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
                <span>
                  {isOverdue ? 'Overdue: ' : 'Due '}
                  {formattedDate}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-1 border-t sm:border-t-0 pt-3 sm:pt-0 border-card-border/60">
        <button
          onClick={() => onEdit(task)}
          className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Edit Task"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 rounded-xl text-muted hover:text-danger hover:bg-danger-light dark:hover:bg-red-950/30 transition-colors"
          aria-label="Delete Task"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
