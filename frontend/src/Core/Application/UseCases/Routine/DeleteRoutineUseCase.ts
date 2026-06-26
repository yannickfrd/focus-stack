import type { RoutinePort } from '@domain/Ports/Routine/RoutinePort';

export class DeleteRoutineUseCase {
  private readonly routinePort: RoutinePort;
  constructor({ routinePort }: { routinePort: RoutinePort }) {
    this.routinePort = routinePort;
  }
  execute(id: string): Promise<void> {
    return this.routinePort.remove(id);
  }
}
