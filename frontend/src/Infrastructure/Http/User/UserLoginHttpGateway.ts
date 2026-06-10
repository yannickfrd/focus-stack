import type { UserLoginPort, LoginInput, LoginResult } from '@domain/Ports/User/UserLoginPort';
import { AbstractHttpGateway } from '@infrastructure/Http/AbstractHttpGateway';

export class UserLoginHttpGateway extends AbstractHttpGateway implements UserLoginPort {
  login(input: LoginInput): Promise<LoginResult> {
    return this.post<LoginResult>('/login', input);
  }
}
