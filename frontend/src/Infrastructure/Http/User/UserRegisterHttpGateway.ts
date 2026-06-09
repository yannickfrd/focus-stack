import type { UserRegisterPort, RegisterInput } from '@domain/Ports/User/UserRegisterPort';
import { AbstractHttpGateway } from '@infrastructure/Http/AbstractHttpGateway';

export class UserRegisterHttpGateway extends AbstractHttpGateway implements UserRegisterPort {
  register(input: RegisterInput): Promise<void> {
    return this.post<void>('/register', input);
  }
}
