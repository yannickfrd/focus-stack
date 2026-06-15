import type { TaskPort, CreateTaskInput, UpdateTaskChanges } from '@domain/Ports/Task/TaskPort';
import type { Task, Priority } from '@domain/Entities/Task/Task';
import { AbstractHttpGateway } from '@infrastructure/Http/AbstractHttpGateway';

type ApiPriority = 'high' | 'middle' | 'low';

interface ApiTask {
  id: number;
  title: string;
  description: string | null;
  priority: ApiPriority;
  done: boolean;
  scheduledFor: 'today' | 'tomorrow' | null;
  estimatedTime: string | null;
  createdAt: string;
}

const PRIORITY_FROM_API: Record<ApiPriority, Priority> = {
  high: 'haute',
  middle: 'moyenne',
  low: 'basse',
};

const PRIORITY_TO_API: Record<Priority, ApiPriority> = {
  haute: 'high',
  moyenne: 'middle',
  basse: 'low',
};

const mapTask = (api: ApiTask): Task => ({
  id: api.id,
  title: api.title,
  description: api.description ?? undefined,
  priority: PRIORITY_FROM_API[api.priority],
  done: api.done,
  scheduledFor: api.scheduledFor ?? undefined,
  estimatedTime: api.estimatedTime ?? undefined,
  createdAt: new Date(api.createdAt),
});

export class TaskHttpGateway extends AbstractHttpGateway implements TaskPort {
  async getAll(): Promise<Task[]> {
    const tasks = await this.get<ApiTask[]>('/tasks');
    return tasks.map(mapTask);
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const task = await this.post<ApiTask>('/tasks', {
      title: input.title,
      description: input.description ?? null,
      priority: PRIORITY_TO_API[input.priority],
      scheduledFor: input.scheduledFor ?? 'today',
      estimatedTime: input.estimatedTime ?? null,
    });
    return mapTask(task);
  }

  async update(id: number, changes: UpdateTaskChanges): Promise<Task> {
    const task = await this.patch<ApiTask>(`/tasks/${id}`, {
      ...(changes.title !== undefined && { title: changes.title }),
      ...(changes.description !== undefined && { description: changes.description ?? null }),
      ...(changes.priority !== undefined && { priority: PRIORITY_TO_API[changes.priority] }),
      ...(changes.estimatedTime !== undefined && { estimatedTime: changes.estimatedTime ?? null }),
    });
    return mapTask(task);
  }

  async toggle(id: number): Promise<Task> {
    const task = await this.patch<ApiTask>(`/tasks/${id}/toggle`, {});
    return mapTask(task);
  }

  async postpone(id: number): Promise<Task> {
    const task = await this.patch<ApiTask>(`/tasks/${id}/postpone`, {});
    return mapTask(task);
  }

  async reorder(ids: number[]): Promise<void> {
    await this.put<void>('/tasks/reorder', { ids });
  }

  async remove(id: number): Promise<void> {
    await this.delete<void>(`/tasks/${id}`);
  }
}
