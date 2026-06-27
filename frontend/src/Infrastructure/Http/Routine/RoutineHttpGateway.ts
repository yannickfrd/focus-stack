import type { RoutinePort, CreateRoutineInput, UpdateRoutineInput } from '@domain/Ports/Routine/RoutinePort';
import type { Routine } from '@domain/Entities/Routine/Routine';
import { AbstractHttpGateway } from '@infrastructure/Http/AbstractHttpGateway';

interface ApiRoutine {
  id: string;
  title: string;
  color: string | null;
  createdAt: string;
}

const mapRoutine = (api: ApiRoutine): Routine => ({
  id: api.id,
  title: api.title,
  color: api.color,
  createdAt: new Date(api.createdAt),
});

export class RoutineHttpGateway extends AbstractHttpGateway implements RoutinePort {
  async getAll(): Promise<Routine[]> {
    const results = await this.get<ApiRoutine[]>('/routines');
    return results.map(mapRoutine);
  }

  async create(input: CreateRoutineInput): Promise<Routine> {
    const result = await this.post<ApiRoutine>('/routines', {
      title: input.title,
      ...(input.color !== undefined && { color: input.color }),
    });
    return mapRoutine(result);
  }

  async update(id: string, input: UpdateRoutineInput): Promise<Routine> {
    const result = await this.patch<ApiRoutine>(`/routines/${id}`, {
      title: input.title,
      color: input.color ?? null,
    });
    return mapRoutine(result);
  }

  async remove(id: string): Promise<void> {
    await this.delete(`/routines/${id}`);
  }
}
