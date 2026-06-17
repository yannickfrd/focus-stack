import type { TaskPort } from '@domain/Ports/Task/TaskPort';

export class ReorderTasksUseCase {
  private readonly taskPort: TaskPort;
  constructor({ taskPort }: { taskPort: TaskPort }) {
    this.taskPort = taskPort;
  }
  execute(ids: number[]): Promise<void> {
    return this.taskPort.reorder(ids);
  }
}
