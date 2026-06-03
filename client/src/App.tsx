import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatsBar } from './components/StatsBar';
import { SearchBar } from './components/SearchBar';
import { FilterBar } from './components/FilterBar';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Task, TaskFilters, CreateTaskDTO } from './types';
import { useCreateTask, useUpdateTask, useDeleteTask } from './hooks/useTasks';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Dashboard() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [filters, setFilters] = useState<TaskFilters>({ status: '', q: '' });

  // Modal and Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // Confirmation Dialog States
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | undefined>(undefined);

  // TanStack Query Mutations
  const createTaskMutation = useCreateTask(filters);
  const updateTaskMutation = useUpdateTask(filters);
  const deleteTaskMutation = useDeleteTask(filters);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCreateClick = () => {
    setEditingTask(undefined);
    setIsFormOpen(true);
  };

  const handleToggleComplete = (task: Task) => {
    const newCompleted = !task.completed;
    updateTaskMutation.mutate(
      {
        id: task.id,
        data: { completed: newCompleted }
      },
      {
        onSuccess: () => {
          toast.success(
            newCompleted ? 'Task marked as completed!' : 'Task marked as active.'
          );
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to update task.');
        }
      }
    );
  };

  const handleDeleteClick = (id: string) => {
    setDeletingTaskId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingTaskId) {
      deleteTaskMutation.mutate(deletingTaskId, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setDeletingTaskId(undefined);
          toast.success('Task deleted successfully!');
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to delete task.');
        }
      });
    }
  };

  const handleFormSubmit = (data: CreateTaskDTO) => {
    if (editingTask) {
      updateTaskMutation.mutate(
        { id: editingTask.id, data },
        {
          onSuccess: () => {
            setIsFormOpen(false);
            setEditingTask(undefined);
            toast.success('Task updated successfully!');
          },
          onError: (err) => {
            toast.error(err.message || 'Failed to update task.');
          }
        }
      );
    } else {
      createTaskMutation.mutate(data, {
        onSuccess: () => {
          setIsFormOpen(false);
          toast.success('Task created successfully!');
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to create task.');
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative pb-16">
      
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 py-8 relative">
        
        {/* Navigation Header */}
        <header className="flex justify-between items-center mb-8 p-4 bg-card/60 backdrop-blur-md border border-card-border rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-teal-500 to-blue-500 text-white rounded-xl">
              <Sparkles size={20} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-blue-400">
              TaskFlow
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-card-border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>

        {/* Dashboard Sections */}
        <main className="space-y-6">
          <StatsBar />

          <SearchBar
            value={filters.q || ''}
            onSearch={(q) => setFilters((prev) => ({ ...prev, q }))}
          />
          
          <FilterBar
            filters={filters}
            onChange={setFilters}
            onAddTaskClick={handleCreateClick}
          />
          
          <TaskList
            filters={filters}
            onEdit={handleEditClick}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteClick}
          />
        </main>
        
      </div>

      {/* Floating TaskForm Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsFormOpen(false)}
          />
          <div className="relative z-50 w-full max-w-lg flex items-center justify-center">
            <TaskForm
              task={editingTask}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingTask(undefined);
              }}
              isSubmitting={createTaskMutation.isPending || updateTaskMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Floating Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Task"
        message="Are you sure you want to permanently delete this task? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setDeletingTaskId(undefined);
        }}
        isConfirming={deleteTaskMutation.isPending}
      />

    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
