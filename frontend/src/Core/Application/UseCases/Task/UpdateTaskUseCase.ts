import type { TaskPort, UpdateTaskChanges } from '@domain/Ports/Task/TaskPort';
import type { Task } from '@domain/Entities/Task/Task';

export class UpdateTaskUseCase {
  private readonly taskPort: TaskPort;
  constructor({ taskPort }: { taskPort: TaskPort }) {
    this.taskPort = taskPort;
  }
  execute(id: number, changes: UpdateTaskChanges): Promise<Task> {
    return this.taskPort.update(id, changes);
  }
}
