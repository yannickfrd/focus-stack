import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AbstractHttpGateway } from '@infrastructure/Http/AbstractHttpGateway';

class TestGateway extends AbstractHttpGateway {
  fetchProtected(): Promise<unknown> {
    return this.get('/protected');
  }
  fetchLogin(): Promise<unknown> {
    return this.post('/login', {});
  }
}

const mockFetch = (status: number, body = '{}') =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: vi.fn().mockResolvedValue(body),
  });

describe('AbstractHttpGateway — gestion des 401', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true,
    });
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('redirige vers /login et vide le cookie sur un 401 hors route auth', async () => {
    document.cookie = 'session=jwt.token; path=/';
    vi.stubGlobal('fetch', mockFetch(401));

    await new TestGateway().fetchProtected().catch(() => {});

    expect(window.location.href).toBe('/login');
    expect(document.cookie).not.toContain('session=jwt.token');
  });

  it('ne redirige pas sur un 401 depuis /login', async () => {
    vi.stubGlobal('fetch', mockFetch(401, JSON.stringify({ message: 'Invalid credentials.' })));

    await new TestGateway().fetchLogin().catch(() => {});

    expect(window.location.href).toBe('');
  });

  it('propage toujours l\'erreur après la redirection', async () => {
    vi.stubGlobal('fetch', mockFetch(401, JSON.stringify({ message: 'Token expiré.' })));

    await expect(new TestGateway().fetchProtected()).rejects.toThrow('Token expiré.');
  });
});
