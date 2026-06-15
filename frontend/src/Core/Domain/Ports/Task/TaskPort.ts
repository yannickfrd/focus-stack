import type { Task, Priority } from '@domain/Entities/Task/Task';

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: Priority;
  scheduledFor?: 'today' | 'tomorrow';
  estimatedTime?: string;
}

export interface UpdateTaskChanges {
  title?: string;
  description?: string;
  priority?: Priority;
  estimatedTime?: string;
}

export interface TaskPort {
  getAll(): Promise<Task[]>;
  create(input: CreateTaskInput): Promise<Task>;
  update(id: number, changes: UpdateTaskChanges): Promise<Task>;
  toggle(id: number): Promise<Task>;
  postpone(id: number): Promise<Task>;
  reorder(ids: number[]): Promise<void>;
  remove(id: number): Promise<void>;
}
