import type { FocusTimePort, CreateFocusTimeInput } from '@domain/Ports/FocusTime/FocusTimePort';
import type { FocusTime } from '@domain/Entities/FocusTime/FocusTime';
import { AbstractHttpGateway } from '@infrastructure/Http/AbstractHttpGateway';

interface ApiFocusTime {
  id: number;
  taskId: number | null;
  duration: number;
  completedAt: string;
}

const mapFocusTime = (api: ApiFocusTime): FocusTime => ({
  id: api.id,
  taskId: api.taskId ?? undefined,
  duration: api.duration,
  completedAt: new Date(api.completedAt),
});

export class FocusTimeHttpGateway extends AbstractHttpGateway implements FocusTimePort {
  async create(input: CreateFocusTimeInput): Promise<FocusTime> {
    const result = await this.post<ApiFocusTime>('/focus-times', {
      duration: input.duration,
      ...(input.taskId !== undefined && { taskId: input.taskId }),
    });
    return mapFocusTime(result);
  }

  async getAll(): Promise<FocusTime[]> {
    const results = await this.get<ApiFocusTime[]>('/focus-times');
    return results.map(mapFocusTime);
  }
}
