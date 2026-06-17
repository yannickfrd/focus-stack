'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@infrastructure/Di/container';
import type { Priority, Task } from '@domain/Entities/Task/Task';
import type { UpdateTaskChanges } from '@domain/Ports/Task/TaskPort';
import type { GetTasksUseCase } from '@application/UseCases/Task/GetTasksUseCase';
import type { CreateTaskUseCase } from '@application/UseCases/Task/CreateTaskUseCase';
import type { UpdateTaskUseCase } from '@application/UseCases/Task/UpdateTaskUseCase';
import type { ReorderTasksUseCase } from '@application/UseCases/Task/ReorderTasksUseCase';
import type { DeleteTaskUseCase } from '@application/UseCases/Task/DeleteTaskUseCase';

const getTasks    = container.resolve<GetTasksUseCase>('getTasksUseCase');
const createTask  = container.resolve<CreateTaskUseCase>('createTaskUseCase');
const updateTask  = container.resolve<UpdateTaskUseCase>('updateTaskUseCase');
const reorderTasks = container.resolve<ReorderTasksUseCase>('reorderTasksUseCase');
const deleteTask  = container.resolve<DeleteTaskUseCase>('deleteTaskUseCase');

const QUERY_KEY = ['tasks'] as const;

export function useTasks() {
  const queryClient = useQueryClient();

  const getCache = () => queryClient.getQueryData<Task[]>(QUERY_KEY) ?? [];
  const setCache = (tasks: Task[]) => queryClient.setQueryData<Task[]>(QUERY_KEY, tasks);
  const cancel   = () => queryClient.cancelQueries({ queryKey: QUERY_KEY });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => getTasks.execute(),
  });

  const createMutation = useMutation({
    mutationFn: (input: { title: string; description?: string; priority: Priority; estimatedTime?: string; scheduledFor?: 'today' | 'tomorrow' }) =>
      createTask.execute(input),
    onMutate: async (input) => {
      await cancel();
      const previous = getCache();
      const optimistic: Task = {
        id: -Date.now(),
        title: input.title,
        description: input.description,
        priority: input.priority,
        done: false,
        scheduledFor: input.scheduledFor ?? 'today',
        estimatedTime: input.estimatedTime,
        createdAt: new Date(),
      };
      setCache([...previous, optimistic]);
      return { previous };
    },
    onError: (_, __, ctx) => setCache(ctx?.previous ?? []),
    onSettled: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, changes }: { id: number; changes: UpdateTaskChanges }) =>
      updateTask.execute(id, changes),
    onMutate: async ({ id, changes }) => {
      await cancel();
      const previous = getCache();
      setCache(previous.map(t => t.id === id ? { ...t, ...changes } : t));
      return { previous };
    },
    onError: (_, __, ctx) => setCache(ctx?.previous ?? []),
    onSettled: invalidate,
  });

  const reorderMutation = useMutation({
    mutationFn: (ids: number[]) => reorderTasks.execute(ids),
    onError: (_, __, ctx) => setCache((ctx as { previous: Task[] } | undefined)?.previous ?? []),
    onSettled: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTask.execute(id),
    onMutate: async (id) => {
      await cancel();
      const previous = getCache();
      setCache(previous.filter(t => t.id !== id));
      return { previous };
    },
    onError: (_, __, ctx) => setCache(ctx?.previous ?? []),
    onSettled: invalidate,
  });

  const handleReorder = (draggedId: number, targetId: number, position: 'before' | 'after') => {
    const previous = getCache();
    const items = [...tasks];
    const from = items.findIndex(t => t.id === draggedId);
    const [moved] = items.splice(from, 1);
    const to = items.findIndex(t => t.id === targetId);
    items.splice(position === 'before' ? to : to + 1, 0, moved);
    setCache(items);
    reorderMutation.mutate(items.map(t => t.id), { context: { previous } });
  };

  return {
    tasks,
    isLoading,
    error: error instanceof Error ? error.message : null,
    createTask: (title: string, description: string, priority: Priority, estimatedTime: string, scheduledFor: 'today' | 'tomorrow' = 'today') =>
      createMutation.mutate({ title, description: description || undefined, priority, estimatedTime: estimatedTime || undefined, scheduledFor }),
    updateTask: (id: number, changes: UpdateTaskChanges) => updateMutation.mutate({ id, changes }),
    toggleTask: (id: number) => {
      const task = getCache().find(t => t.id === id);
      if (task) updateMutation.mutate({ id, changes: { done: !task.done } });
    },
    postponeTask: (id: number) => {
      const task = getCache().find(t => t.id === id);
      if (task) updateMutation.mutate({ id, changes: { scheduledFor: task.scheduledFor === 'tomorrow' ? 'today' : 'tomorrow' } });
    },
    reorderTask: handleReorder,
    deleteTask: (id: number) => deleteMutation.mutate(id),
  };
}
