import type { UserPort, RegisterInput } from '@domain/Ports/User/UserPort';
import type { User } from '@domain/Entities/User/User';
import { AbstractHttpGateway } from '@infrastructure/Http/AbstractHttpGateway';

export class UserRegisterHttpGateway extends AbstractHttpGateway implements UserPort {
  register(input: RegisterInput): Promise<User> {
    return this.post<User>('/register', input);
  }
}
