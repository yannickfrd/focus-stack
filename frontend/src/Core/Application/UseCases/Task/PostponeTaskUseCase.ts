import type { TaskPort } from '@domain/Ports/Task/TaskPort';
import type { Task } from '@domain/Entities/Task/Task';

export class PostponeTaskUseCase {
  private readonly taskPort: TaskPort;
  constructor({ taskPort }: { taskPort: TaskPort }) {
    this.taskPort = taskPort;
  }
  execute(id: number): Promise<Task> {
    return this.taskPort.postpone(id);
  }
}
