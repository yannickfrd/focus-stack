import type { FocusTime } from '@domain/Entities/FocusTime/FocusTime';

export interface CreateFocusTimeInput {
  duration: number;
  taskId?: number;
}

export interface FocusTimePort {
  create(input: CreateFocusTimeInput): Promise<FocusTime>;
  getAll(): Promise<FocusTime[]>;
}
