import type { FocusTimePort } from '@domain/Ports/FocusTime/FocusTimePort';
import type { FocusTime } from '@domain/Entities/FocusTime/FocusTime';

export class ListFocusTimesUseCase {
  private readonly focusTimePort: FocusTimePort;
  constructor({ focusTimePort }: { focusTimePort: FocusTimePort }) {
    this.focusTimePort = focusTimePort;
  }
  execute(): Promise<FocusTime[]> {
    return this.focusTimePort.getAll();
  }
}
