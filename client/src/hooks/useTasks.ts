import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/tasks';
import { Task, TaskFilters } from '../types';

export const useTasks = (filters: TaskFilters = {}) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => api.getTasks(filters),
  });
};

export const useTaskStats = () => {
  return useQuery({
    queryKey: ['tasks', 'stats'],
    queryFn: api.getStats,
  });
};

export const useCreateTask = (filters: TaskFilters = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createTask,
    onMutate: async (newTaskDto) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', filters]);

      // Optimistically add the new task (generate a temporary ID)
      if (previousTasks) {
        const tempTask: Task = {
          id: `temp-${Math.random().toString()}`,
          title: newTaskDto.title,
          description: newTaskDto.description || '',
          due_date: newTaskDto.due_date || null,
          completed: newTaskDto.completed || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData<Task[]>(
          ['tasks', filters],
          [tempTask, ...previousTasks]
        );
      }

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (_err, _newTask, context) => {
      // Rollback to previous state
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', filters], context.previousTasks);
      }
    },
    onSettled: () => {
      // Invalidate tasks lists and stats to refetch accurate data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = (filters: TaskFilters = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.updateTask,
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', filters]);

      // Optimistically update the task in the cache list
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          ['tasks', filters],
          previousTasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...data,
                  updated_at: new Date().toISOString(),
                }
              : t
          )
        );
      }

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', filters], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = (filters: TaskFilters = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteTask,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', filters]);

      // Optimistically remove the deleted task from cache list
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          ['tasks', filters],
          previousTasks.filter((t) => t.id !== id)
        );
      }

      return { previousTasks };
    },
    onError: (_err, _id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', filters], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
