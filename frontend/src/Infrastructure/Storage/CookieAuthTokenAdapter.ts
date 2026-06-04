import type { AuthTokenPort } from '@domain/Ports/Auth/AuthTokenPort';

export class CookieAuthTokenAdapter implements AuthTokenPort {
  store(userId: string): void {
    document.cookie = `session=${userId}; path=/; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`;
  }

  clear(): void {
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}
