export type Priority = 'haute' | 'moyenne' | 'basse';

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: Priority;
  done: boolean;
  scheduledFor?: 'today' | 'tomorrow';
  createdAt: Date;
  estimatedTime?: string;
}
