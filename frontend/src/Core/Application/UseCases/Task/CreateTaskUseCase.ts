import type { TaskPort, CreateTaskInput } from '@domain/Ports/Task/TaskPort';
import type { Task } from '@domain/Entities/Task/Task';

export class CreateTaskUseCase {
  private readonly taskPort: TaskPort;
  constructor({ taskPort }: { taskPort: TaskPort }) {
    this.taskPort = taskPort;
  }
  execute(input: CreateTaskInput): Promise<Task> {
    return this.taskPort.create(input);
  }
}
