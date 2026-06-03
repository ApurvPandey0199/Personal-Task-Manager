import { Task, TaskStats, CreateTaskDTO, UpdateTaskDTO, TaskFilters } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const getTasks = async (filters: TaskFilters = {}): Promise<Task[]> => {
  const params = new URLSearchParams();
  if (filters.status) {
    params.append('status', filters.status);
  }
  if (filters.q) {
    params.append('q', filters.q);
  }

  const res = await fetch(`${API_BASE}/api/tasks?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return res.json();
};

export const getTaskById = async (id: string): Promise<Task> => {
  const res = await fetch(`${API_BASE}/api/tasks/${id}`);
  if (!res.ok) {
    throw new Error('Task not found');
  }
  return res.json();
};

export const createTask = async (task: CreateTaskDTO): Promise<Task> => {
  const res = await fetch(`${API_BASE}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create task');
  }
  return res.json();
};

export const updateTask = async ({ id, data }: { id: string; data: UpdateTaskDTO }): Promise<Task> => {
  const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update task');
  }
  return res.json();
};

export const deleteTask = async (id: string): Promise<string> => {
  const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete task');
  }
  return id;
};

export const getStats = async (): Promise<TaskStats> => {
  const res = await fetch(`${API_BASE}/api/tasks/stats`);
  if (!res.ok) {
    throw new Error('Failed to fetch statistics');
  }
  return res.json();
};
