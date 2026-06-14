import { PUBLIC_PATHS } from '@/config/publicPaths';
import { tokenStore } from '@infrastructure/Storage/InMemoryTokenStore';

export abstract class AbstractHttpGateway {
  protected readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';
  }

  private buildHeaders(path: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    const token = tokenStore.get();
    if (token && !PUBLIC_PATHS.includes(path)) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(path: string, options: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: this.buildHeaders(path),
      credentials: 'include',
    });

    const text = await res.text().catch(() => '');
    const parsed = <U>(): U => {
      try { return text ? (JSON.parse(text) as U) : ({} as U); } catch { return {} as U; }
    };

    if (!res.ok) {
      if (res.status === 401 && !PUBLIC_PATHS.includes(path)) {
        const refreshed = await this.tryRefreshToken();
        if (refreshed) return this.request<T>(path, options);
        window.location.href = '/login';
      }
      const body = parsed<{ error?: string; message?: string }>();
      throw new Error(body.error ?? body.message ?? 'Request failed.');
    }

    return (text ? JSON.parse(text) : undefined) as T;
  }

  private async tryRefreshToken(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });
      if (!res.ok) return false;
      const text = await res.text().catch(() => '');
      if (text) {
        const data = JSON.parse(text) as { token?: string };
        if (data.token) tokenStore.set(data.token);
      }
      return true;
    } catch {
      return false;
    }
  }

  protected get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  protected post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  }

  protected put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
  }

  protected patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
  }

  protected delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}
