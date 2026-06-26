import type { Routine } from '@domain/Entities/Routine/Routine';

export interface CreateRoutineInput {
  title: string;
  color?: string;
}

export interface UpdateRoutineInput {
  title: string;
  color?: string | null;
}

export interface RoutinePort {
  getAll(): Promise<Routine[]>;
  create(input: CreateRoutineInput): Promise<Routine>;
  update(id: string, input: UpdateRoutineInput): Promise<Routine>;
  remove(id: string): Promise<void>;
}
