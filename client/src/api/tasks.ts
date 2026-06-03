import { Task, TaskStats, CreateTaskDTO, UpdateTaskDTO, TaskFilters } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

// LocalStorage fallback database helpers
const LOCAL_STORAGE_KEY = 'taskflow_tasks';

const getLocalTasks = (): Task[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    const initialTasks: Task[] = [
      {
        id: 'demo-1',
        title: 'Welcome to TaskFlow! ⚡',
        description: 'This app is running in client-side standalone mode. All your tasks will be saved in your browser local storage!',
        due_date: new Date().toISOString().split('T')[0],
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'demo-2',
        title: 'Create your first task',
        description: 'Use the "+" button below to add a new task with titles, descriptions and due dates.',
        due_date: null,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialTasks));
    return initialTasks;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const saveLocalTasks = (tasks: Task[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
};

// Check if server is reachable (we will cache this state to avoid repeating slow network timeouts)
let useFallback = false;
let checkDone = false;

const checkServer = async (): Promise<boolean> => {
  if (checkDone) return useFallback;

  // If no backend API URL is provided and we are not running on localhost,
  // we are in a static production deployment (like Vercel) without a backend.
  // We should immediately fall back to local storage.
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!API_BASE && !isLocal) {
    useFallback = true;
    checkDone = true;
    console.warn("No VITE_API_URL provided in production. Falling back to local storage.");
    return useFallback;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout for fast fallback
    const res = await fetch(`${API_BASE}/api/tasks/stats`, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    // Ensure the response is OK and it's actually JSON (not index.html from SPA rewrites)
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      useFallback = false;
    } else {
      useFallback = true;
    }
  } catch (error) {
    useFallback = true;
  }
  checkDone = true;
  if (useFallback) {
    console.warn("TaskFlow Server not reachable. Falling back to local storage browser mode.");
  }
  return useFallback;
};

export const getTasks = async (filters: TaskFilters = {}): Promise<Task[]> => {
  const isOffline = await checkServer();
  if (isOffline) {
    let tasks = getLocalTasks();
    
    // Apply filters
    if (filters.status) {
      const isCompleted = filters.status === 'completed';
      tasks = tasks.filter(t => t.completed === isCompleted);
    }
    if (filters.q) {
      const query = filters.q.toLowerCase();
      tasks = tasks.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.description.toLowerCase().includes(query)
      );
    }
    
    // Sort by created_at DESC
    return tasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

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
  const isOffline = await checkServer();
  if (isOffline) {
    const task = getLocalTasks().find(t => t.id === id);
    if (!task) throw new Error('Task not found');
    return task;
  }

  const res = await fetch(`${API_BASE}/api/tasks/${id}`);
  if (!res.ok) {
    throw new Error('Task not found');
  }
  return res.json();
};

export const createTask = async (task: CreateTaskDTO): Promise<Task> => {
  const isOffline = await checkServer();
  if (isOffline) {
    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || null,
      completed: task.completed || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const tasks = getLocalTasks();
    tasks.push(newTask);
    saveLocalTasks(tasks);
    return newTask;
  }

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
  const isOffline = await checkServer();
  if (isOffline) {
    const tasks = getLocalTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) throw new Error('Task not found');
    
    const updatedTask: Task = {
      ...tasks[taskIndex],
      ...data,
      updated_at: new Date().toISOString(),
    } as Task;
    
    tasks[taskIndex] = updatedTask;
    saveLocalTasks(tasks);
    return updatedTask;
  }

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
  const isOffline = await checkServer();
  if (isOffline) {
    const tasks = getLocalTasks().filter(t => t.id !== id);
    saveLocalTasks(tasks);
    return id;
  }

  const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete task');
  }
  return id;
};

export const getStats = async (): Promise<TaskStats> => {
  const isOffline = await checkServer();
  if (isOffline) {
    const tasks = getLocalTasks();
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const overdue = tasks.filter(t => !t.completed && t.due_date && t.due_date < todayStr).length;
    
    return { total, completed, pending, completionRate, overdue };
  }

  const res = await fetch(`${API_BASE}/api/tasks/stats`);
  if (!res.ok) {
    throw new Error('Failed to fetch statistics');
  }
  return res.json();
};
