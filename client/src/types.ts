export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  due_date?: string | null;
  completed?: boolean;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  due_date?: string | null;
  completed?: boolean;
}

export interface TaskFilters {
  status?: 'completed' | 'pending' | 'all' | '';
  q?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
  overdue: number;
}
