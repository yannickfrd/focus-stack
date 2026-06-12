import { PUBLIC_PATHS } from '@/config/publicPaths';

export abstract class AbstractHttpGateway {
  protected readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';
  }

  private get defaultHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  private async request<T>(path: string, options: RequestInit): Promise<T> {
    const headers: Record<string, string> = { ...this.defaultHeaders };
    if (!PUBLIC_PATHS.includes(path)) {
      const token = document.cookie.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers });

    const text = await res.text().catch(() => '');
    const parsed = <U>(): U => {
      try { return text ? (JSON.parse(text) as U) : ({} as U); } catch { return {} as U; }
    };

    if (!res.ok) {
      if (res.status === 401 && !PUBLIC_PATHS.includes(path)) {
        const refreshed = await this.tryRefreshToken();
        if (refreshed) return this.request<T>(path, options);
        document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/login';
      }
      const body = parsed<{ error?: string; message?: string }>();
      throw new Error(body.error ?? body.message ?? 'Request failed.');
    }

    return (text ? JSON.parse(text) : undefined) as T;
  }

  private async tryRefreshToken(): Promise<boolean> {
    const refreshToken = document.cookie.match(/(?:^|;\s*)refresh_token=([^;]+)/)?.[1];
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${this.baseUrl}/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) return false;
      const text = await res.text();
      const data = JSON.parse(text) as { token: string; refresh_token: string };
      document.cookie = `session=${data.token}; path=/; SameSite=Strict; Max-Age=3600`;
      document.cookie = `refresh_token=${data.refresh_token}; path=/; SameSite=Strict; Max-Age=2592000`;
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
