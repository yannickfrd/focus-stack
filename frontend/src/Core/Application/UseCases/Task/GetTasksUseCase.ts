import type { TaskPort } from '@domain/Ports/Task/TaskPort';
import type { Task } from '@domain/Entities/Task/Task';

export class GetTasksUseCase {
  private readonly taskPort: TaskPort;
  constructor({ taskPort }: { taskPort: TaskPort }) {
    this.taskPort = taskPort;
  }
  execute(): Promise<Task[]> {
    return this.taskPort.getAll();
  }
}
