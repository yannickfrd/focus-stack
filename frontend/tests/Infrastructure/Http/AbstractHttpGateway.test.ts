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
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('redirige vers /login et vide les cookies sur un 401 sans refresh_token', async () => {
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

describe('AbstractHttpGateway — rafraîchissement transparent du token', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true,
    });
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retente la requête et résout si le refresh réussit', async () => {
    document.cookie = 'session=expired.token; path=/';
    document.cookie = 'refresh_token=valid.refresh; path=/';

    let callCount = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1)
        return Promise.resolve({ ok: false, status: 401, text: vi.fn().mockResolvedValue('{}') });
      if (callCount === 2)
        return Promise.resolve({
          ok: true, status: 200,
          text: vi.fn().mockResolvedValue(JSON.stringify({ token: 'new.token', refresh_token: 'new.refresh' })),
        });
      return Promise.resolve({ ok: true, status: 200, text: vi.fn().mockResolvedValue('{}') });
    }));

    await new TestGateway().fetchProtected();

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(document.cookie).toContain('session=new.token');
    expect(document.cookie).toContain('refresh_token=new.refresh');
  });

  it('redirige vers /login et vide les deux cookies si le refresh échoue', async () => {
    document.cookie = 'session=expired.token; path=/';
    document.cookie = 'refresh_token=invalid.refresh; path=/';

    let callCount = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1)
        return Promise.resolve({ ok: false, status: 401, text: vi.fn().mockResolvedValue('{}') });
      return Promise.resolve({ ok: false, status: 401, text: vi.fn().mockResolvedValue('{}') });
    }));

    await new TestGateway().fetchProtected().catch(() => {});

    expect(window.location.href).toBe('/login');
    expect(document.cookie).not.toContain('session=');
    expect(document.cookie).not.toContain('refresh_token=');
  });

  it("ne tente pas le refresh si aucun refresh_token n'est stocké", async () => {
    document.cookie = 'session=expired.token; path=/';
    vi.stubGlobal('fetch', mockFetch(401));

    await new TestGateway().fetchProtected().catch(() => {});

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe('/login');
  });
});
