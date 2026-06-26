import type { RoutinePort, CreateRoutineInput } from '@domain/Ports/Routine/RoutinePort';
import type { Routine } from '@domain/Entities/Routine/Routine';

export class CreateRoutineUseCase {
  private readonly routinePort: RoutinePort;
  constructor({ routinePort }: { routinePort: RoutinePort }) {
    this.routinePort = routinePort;
  }
  execute(input: CreateRoutineInput): Promise<Routine> {
    return this.routinePort.create(input);
  }
}
