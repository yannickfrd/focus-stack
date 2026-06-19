import type { FocusTimePort, CreateFocusTimeInput } from '@domain/Ports/FocusTime/FocusTimePort';
import type { FocusTime } from '@domain/Entities/FocusTime/FocusTime';

export class CreateFocusTimeUseCase {
  private readonly focusTimePort: FocusTimePort;
  constructor({ focusTimePort }: { focusTimePort: FocusTimePort }) {
    this.focusTimePort = focusTimePort;
  }
  execute(input: CreateFocusTimeInput): Promise<FocusTime> {
    return this.focusTimePort.create(input);
  }
}
