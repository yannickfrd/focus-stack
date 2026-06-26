import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@infrastructure/Di/container';
import type { CreateFocusTimeUseCase } from '@application/UseCases/FocusTime/CreateFocusTimeUseCase';
import type { ListFocusTimesUseCase } from '@application/UseCases/FocusTime/ListFocusTimesUseCase';
import type { CreateFocusTimeInput } from '@domain/Ports/FocusTime/FocusTimePort';

const createFocusTimeUseCase = container.resolve<CreateFocusTimeUseCase>('createFocusTimeUseCase');
const listFocusTimesUseCase = container.resolve<ListFocusTimesUseCase>('listFocusTimesUseCase');

export function useFocusTime() {
  const queryClient = useQueryClient();

  const { data: focusTimes = [] } = useQuery({
    queryKey: ['focusTimes'],
    queryFn: () => listFocusTimesUseCase.execute(),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateFocusTimeInput) => createFocusTimeUseCase.execute(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['focusTimes'] }),
  });

  return {
    focusTimes,
    createFocusTime: (input: CreateFocusTimeInput) => createMutation.mutate(input),
  };
}
