'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@infrastructure/Di/container';
import type { Routine } from '@domain/Entities/Routine/Routine';
import type { GetRoutinesUseCase } from '@application/UseCases/Routine/GetRoutinesUseCase';
import type { CreateRoutineUseCase } from '@application/UseCases/Routine/CreateRoutineUseCase';
import type { UpdateRoutineUseCase } from '@application/UseCases/Routine/UpdateRoutineUseCase';
import type { DeleteRoutineUseCase } from '@application/UseCases/Routine/DeleteRoutineUseCase';

const getRoutines    = container.resolve<GetRoutinesUseCase>('getRoutinesUseCase');
const createRoutine  = container.resolve<CreateRoutineUseCase>('createRoutineUseCase');
const updateRoutine  = container.resolve<UpdateRoutineUseCase>('updateRoutineUseCase');
const deleteRoutine  = container.resolve<DeleteRoutineUseCase>('deleteRoutineUseCase');

const QUERY_KEY = ['routines'] as const;

export function useRoutines() {
  const queryClient = useQueryClient();

  const getCache = () => queryClient.getQueryData<Routine[]>(QUERY_KEY) ?? [];
  const setCache = (routines: Routine[]) => queryClient.setQueryData<Routine[]>(QUERY_KEY, routines);
  const cancel   = () => queryClient.cancelQueries({ queryKey: QUERY_KEY });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const { data: routines = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => getRoutines.execute(),
  });

  const createMutation = useMutation({
    mutationFn: (input: { title: string; color?: string }) => createRoutine.execute(input),
    onMutate: async (input) => {
      await cancel();
      const previous = getCache();
      const optimistic: Routine = {
        id: `temp-${Date.now()}`,
        title: input.title,
        color: input.color ?? null,
        createdAt: new Date(),
      };
      setCache([...previous, optimistic]);
      return { previous };
    },
    onError: (_, __, ctx) => setCache(ctx?.previous ?? []),
    onSettled: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, title, color }: { id: string; title: string; color?: string | null }) =>
      updateRoutine.execute(id, { title, color }),
    onMutate: async ({ id, title, color }) => {
      await cancel();
      const previous = getCache();
      setCache(previous.map(r => r.id === id ? { ...r, title, color: color ?? r.color } : r));
      return { previous };
    },
    onError: (_, __, ctx) => setCache(ctx?.previous ?? []),
    onSettled: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRoutine.execute(id),
    onMutate: async (id) => {
      await cancel();
      const previous = getCache();
      setCache(previous.filter(r => r.id !== id));
      return { previous };
    },
    onError: (_, __, ctx) => setCache(ctx?.previous ?? []),
    onSettled: invalidate,
  });

  return {
    routines,
    isLoading,
    addRoutine: (title: string, color?: string) => createMutation.mutate({ title, color }),
    editRoutine: (id: string, title: string, color?: string | null) => updateMutation.mutate({ id, title, color }),
    removeRoutine: (id: string) => deleteMutation.mutate(id),
  };
}
