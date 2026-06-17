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
  done?: boolean;
  scheduledFor?: 'today' | 'tomorrow';
}

export interface TaskPort {
  getAll(): Promise<Task[]>;
  create(input: CreateTaskInput): Promise<Task>;
  update(id: number, changes: UpdateTaskChanges): Promise<Task>;
  reorder(ids: number[]): Promise<void>;
  remove(id: number): Promise<void>;
}
