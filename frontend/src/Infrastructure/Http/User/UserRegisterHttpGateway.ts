import type { UserPort, RegisterInput } from '@domain/Ports/User/UserPort';
import type { User } from '@domain/Entities/User/User';
import { AbstractHttpGateway } from '@infrastructure/Http/AbstractHttpGateway';

export class UserRegisterHttpGateway extends AbstractHttpGateway implements UserPort {
  async register(input: RegisterInput): Promise<User> {
    const res = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const body: { error?: string } = await res.json().catch(() => ({}));
      throw new Error(body.error ?? 'Registration failed.');
    }

    return res.json() as Promise<User>;
  }
}
