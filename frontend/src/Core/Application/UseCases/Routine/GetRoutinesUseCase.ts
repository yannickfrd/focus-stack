import type { RoutinePort } from '@domain/Ports/Routine/RoutinePort';
import type { Routine } from '@domain/Entities/Routine/Routine';

export class GetRoutinesUseCase {
  private readonly routinePort: RoutinePort;
  constructor({ routinePort }: { routinePort: RoutinePort }) {
    this.routinePort = routinePort;
  }
  execute(): Promise<Routine[]> {
    return this.routinePort.getAll();
  }
}
