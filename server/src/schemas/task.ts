import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required and must not be empty').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional().default(''),
  due_date: z.string().nullable().optional().default(null).refine((val) => {
    if (!val) return true;
    // Basic date format verification YYYY-MM-DD
    return /^\d{4}-\d{2}-\d{2}$/.test(val);
  }, 'Due date must be in YYYY-MM-DD format'),
  completed: z.boolean().optional().default(false)
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title must not be empty').max(100, 'Title cannot exceed 100 characters').optional(),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  due_date: z.string().nullable().optional().refine((val) => {
    if (!val) return true;
    return /^\d{4}-\d{2}-\d{2}$/.test(val);
  }, 'Due date must be in YYYY-MM-DD format'),
  completed: z.boolean().optional()
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
