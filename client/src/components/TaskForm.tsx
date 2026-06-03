import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Task, CreateTaskDTO } from '../types';
import { Calendar, X, Check } from 'lucide-react';

const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional().default(''),
  due_date: z.string().nullable().optional().default(null).refine((val) => {
    if (!val) return true;
    return /^\d{4}-\d{2}-\d{2}$/.test(val);
  }, 'Due date must be in YYYY-MM-DD format'),
  completed: z.boolean().optional().default(false)
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: CreateTaskDTO) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      due_date: task?.due_date || '',
      completed: task?.completed || false
    }
  });

  const handleFormSubmit = (data: TaskFormData) => {
    onSubmit({
      title: data.title,
      description: data.description,
      due_date: data.due_date || null,
      completed: data.completed
    });
  };

  return (
    <div className="relative rounded-2xl border border-card-border bg-card/80 backdrop-blur-md text-foreground shadow-lg p-6 max-w-lg w-full transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
          {task ? 'Edit Task' : 'Create New Task'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted"
          aria-label="Close Form"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* Title Input */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted">
            Title <span className="text-danger">*</span>
          </label>
          <input
            id="title"
            type="text"
            placeholder="What needs to be done?"
            className={`flex h-10 w-full rounded-lg border bg-transparent px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.title ? 'border-danger focus:ring-danger' : 'border-card-border'
            }`}
            {...register('title')}
          />
          {errors.title && (
            <p className="text-xs text-danger font-medium mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description Textarea */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Add some details or notes..."
            className="flex w-full rounded-lg border border-card-border bg-transparent px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-danger font-medium mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Due Date & Completed status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Due Date Picker Popover */}
          <div className="space-y-1.5">
            <label htmlFor="due_date" className="text-xs font-semibold uppercase tracking-wider text-muted">
              Due Date
            </label>
            <div className="relative">
              <input
                id="due_date"
                type="date"
                className="flex h-10 w-full rounded-lg border border-card-border bg-transparent pl-10 pr-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                {...register('due_date')}
              />
              <div className="absolute left-3 top-2.5 text-muted pointer-events-none">
                <Calendar size={16} />
              </div>
            </div>
            {errors.due_date && (
              <p className="text-xs text-danger font-medium mt-1">{errors.due_date.message}</p>
            )}
          </div>

          {/* Completed Checkbox */}
          {task && (
            <div className="flex items-center gap-3 mt-6 sm:mt-8">
              <label htmlFor="completed" className="relative flex items-center justify-center h-5 w-5 rounded border border-card-border cursor-pointer select-none bg-transparent hover:border-primary transition-all">
                <input
                  id="completed"
                  type="checkbox"
                  className="peer sr-only"
                  {...register('completed')}
                />
                <span className="hidden peer-checked:flex items-center justify-center h-full w-full bg-primary text-white rounded-[3px]">
                  <Check size={12} strokeWidth={3} />
                </span>
              </label>
              <span className="text-sm font-medium text-foreground select-none">Mark as Completed</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-card-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-card-border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 transition-colors min-w-[80px]"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : task ? (
              'Save Changes'
            ) : (
              'Create Task'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
