export abstract class AbstractHttpGateway {
  protected readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';
  }

  protected get defaultHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }
}
