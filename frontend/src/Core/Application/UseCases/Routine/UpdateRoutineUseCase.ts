import type { RoutinePort, UpdateRoutineInput } from '@domain/Ports/Routine/RoutinePort';
import type { Routine } from '@domain/Entities/Routine/Routine';

export class UpdateRoutineUseCase {
  private readonly routinePort: RoutinePort;
  constructor({ routinePort }: { routinePort: RoutinePort }) {
    this.routinePort = routinePort;
  }
  execute(id: string, input: UpdateRoutineInput): Promise<Routine> {
    return this.routinePort.update(id, input);
  }
}
