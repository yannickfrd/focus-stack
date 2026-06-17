import type { TaskPort } from '@domain/Ports/Task/TaskPort';

export class DeleteTaskUseCase {
  private readonly taskPort: TaskPort;
  constructor({ taskPort }: { taskPort: TaskPort }) {
    this.taskPort = taskPort;
  }
  execute(id: number): Promise<void> {
    return this.taskPort.remove(id);
  }
}
