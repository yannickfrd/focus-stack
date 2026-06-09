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

    if (!res.ok) {
      const body: { error?: string } = await res.json().catch(() => ({}));
      throw new Error(body.error ?? 'Request failed.');
    }

    return res.json() as Promise<T>;
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
