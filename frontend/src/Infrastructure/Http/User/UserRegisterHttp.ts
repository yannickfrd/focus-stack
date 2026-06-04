import type { UserRepositoryInterface, RegisterInput } from '@domain/Repositories/User/UserRepositoryInterface';
import type { User } from '@domain/Entities/User/User';
import { AbstractHttpRepository } from '@infrastructure/Http/AbstractHttpRepository';

export class UserRegisterHttp extends AbstractHttpRepository implements UserRepositoryInterface {
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
