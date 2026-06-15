'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@infrastructure/Di/container';
import type { Priority } from '@domain/Entities/Task/Task';
import type { UpdateTaskChanges } from '@domain/Ports/Task/TaskPort';
import type { GetTasksUseCase } from '@application/UseCases/Task/GetTasksUseCase';
import type { CreateTaskUseCase } from '@application/UseCases/Task/CreateTaskUseCase';
import type { UpdateTaskUseCase } from '@application/UseCases/Task/UpdateTaskUseCase';
import type { ToggleTaskUseCase } from '@application/UseCases/Task/ToggleTaskUseCase';
import type { PostponeTaskUseCase } from '@application/UseCases/Task/PostponeTaskUseCase';
import type { ReorderTasksUseCase } from '@application/UseCases/Task/ReorderTasksUseCase';
import type { DeleteTaskUseCase } from '@application/UseCases/Task/DeleteTaskUseCase';
import type { Task } from '@domain/Entities/Task/Task';

const getTasks = container.resolve<GetTasksUseCase>('getTasksUseCase');
const createTask = container.resolve<CreateTaskUseCase>('createTaskUseCase');
const updateTask = container.resolve<UpdateTaskUseCase>('updateTaskUseCase');
const toggleTask = container.resolve<ToggleTaskUseCase>('toggleTaskUseCase');
const postponeTask = container.resolve<PostponeTaskUseCase>('postponeTaskUseCase');
const reorderTasks = container.resolve<ReorderTasksUseCase>('reorderTasksUseCase');
const deleteTask = container.resolve<DeleteTaskUseCase>('deleteTaskUseCase');

const QUERY_KEY = ['tasks'] as const;

export function useTasks() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => getTasks.execute(),
  });

  const createMutation = useMutation({
    mutationFn: (input: { title: string; description?: string; priority: Priority; estimatedTime?: string; scheduledFor?: 'today' | 'tomorrow' }) =>
      createTask.execute(input),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, changes }: { id: number; changes: UpdateTaskChanges }) =>
      updateTask.execute(id, changes),
    onSuccess: invalidate,
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => toggleTask.execute(id),
    onSuccess: invalidate,
  });

  const postponeMutation = useMutation({
    mutationFn: (id: number) => postponeTask.execute(id),
    onSuccess: invalidate,
  });

  const reorderMutation = useMutation({
    mutationFn: (ids: number[]) => reorderTasks.execute(ids),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTask.execute(id),
    onSuccess: invalidate,
  });

  const handleReorder = (draggedId: number, targetId: number, position: 'before' | 'after') => {
    const items = [...tasks];
    const from = items.findIndex((t) => t.id === draggedId);
    const [moved] = items.splice(from, 1);
    const to = items.findIndex((t) => t.id === targetId);
    items.splice(position === 'before' ? to : to + 1, 0, moved);
    reorderMutation.mutate(items.map((t: Task) => t.id));
  };

  return {
    tasks,
    isLoading,
    error: error instanceof Error ? error.message : null,
    createTask: (title: string, description: string, priority: Priority, estimatedTime: string, scheduledFor: 'today' | 'tomorrow' = 'today') =>
      createMutation.mutate({ title, description: description || undefined, priority, estimatedTime: estimatedTime || undefined, scheduledFor }),
    updateTask: (id: number, changes: UpdateTaskChanges) => updateMutation.mutate({ id, changes }),
    toggleTask: (id: number) => toggleMutation.mutate(id),
    postponeTask: (id: number) => postponeMutation.mutate(id),
    reorderTask: handleReorder,
    deleteTask: (id: number) => deleteMutation.mutate(id),
  };
}
