import type { AuthTokenPort } from '@domain/Ports/Auth/AuthTokenPort';

export class CookieAuthTokenAdapter implements AuthTokenPort {
  store(token: string): void {
    document.cookie = `session=${token}; path=/; SameSite=Strict; Max-Age=3600`;
  }

  clear(): void {
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

  storeRefreshToken(token: string): void {
    document.cookie = `refresh_token=${token}; path=/; SameSite=Strict; Max-Age=2592000`;
  }

  clearRefreshToken(): void {
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}
