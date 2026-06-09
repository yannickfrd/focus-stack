import type { UserRegisterPort, RegisterInput } from '@domain/Ports/User/UserRegisterPort';
import type { User } from '@domain/Entities/User/User';
import { AbstractHttpGateway } from '@infrastructure/Http/AbstractHttpGateway';

export class UserRegisterHttpGateway extends AbstractHttpGateway implements UserRegisterPort {
  register(input: RegisterInput): Promise<User> {
    return this.post<User>('/register', input);
  }
}
