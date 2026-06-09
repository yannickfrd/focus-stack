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
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: this.defaultHeaders,
    });

    const text = await res.text().catch(() => '');
    const parsed = <U>(): U => {
      try { return text ? (JSON.parse(text) as U) : ({} as U); } catch { return {} as U; }
    };

    if (!res.ok) {
      if (res.status === 401 && !PUBLIC_PATHS.includes(path)) {
        document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/login';
      }
      const body = parsed<{ error?: string; message?: string }>();
      throw new Error(body.error ?? body.message ?? 'Request failed.');
    }

    return (text ? JSON.parse(text) : undefined) as T;
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
