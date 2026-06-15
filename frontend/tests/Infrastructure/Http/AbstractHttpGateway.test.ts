import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AbstractHttpGateway } from '@infrastructure/Http/AbstractHttpGateway';
import { tokenStore } from '@infrastructure/Storage/InMemoryTokenStore';

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

describe('AbstractHttpGateway — credentials', () => {
  beforeEach(() => {
    tokenStore.clear();
    vi.stubGlobal('fetch', mockFetch(200));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    tokenStore.clear();
  });

  it('envoie credentials: include sur toutes les requêtes', async () => {
    await new TestGateway().fetchLogin();

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ credentials: 'include' }),
    );
  });
});

describe('AbstractHttpGateway — Authorization header', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    tokenStore.clear();
  });

  it("envoie le header Authorization sur les routes protégées quand un token est présent", async () => {
    tokenStore.set('my.jwt.token');
    vi.stubGlobal('fetch', mockFetch(200));

    await new TestGateway().fetchProtected();

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer my.jwt.token' }),
      }),
    );
  });

  it("n'envoie pas le header Authorization sur les routes publiques", async () => {
    tokenStore.set('my.jwt.token');
    vi.stubGlobal('fetch', mockFetch(200));

    await new TestGateway().fetchLogin();

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.not.objectContaining({ Authorization: expect.any(String) }),
      }),
    );
  });

  it("n'envoie pas le header Authorization quand le tokenStore est vide", async () => {
    vi.stubGlobal('fetch', mockFetch(200));

    await new TestGateway().fetchProtected();

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.not.objectContaining({ Authorization: expect.any(String) }),
      }),
    );
  });
});

describe('AbstractHttpGateway — gestion des 401', () => {
  beforeEach(() => {
    tokenStore.clear();
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    tokenStore.clear();
  });

  it('redirige vers /login sur un 401 quand le refresh échoue', async () => {
    let callCount = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve({ ok: false, status: 401, text: vi.fn().mockResolvedValue('{}') });
    }));

    await new TestGateway().fetchProtected().catch(() => {});

    expect(window.location.href).toBe('/login');
  });

  it('ne redirige pas sur un 401 depuis /login', async () => {
    vi.stubGlobal('fetch', mockFetch(401, JSON.stringify({ message: 'Invalid credentials.' })));

    await new TestGateway().fetchLogin().catch(() => {});

    expect(window.location.href).toBe('');
  });

  it('propage toujours l\'erreur après la redirection', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false, status: 401,
      text: vi.fn().mockResolvedValue(JSON.stringify({ message: 'Token expiré.' })),
    }));

    await expect(new TestGateway().fetchProtected()).rejects.toThrow('Token expiré.');
  });

  it("appelle /logout avant de rediriger quand le refresh échoue", async () => {
    const urls: string[] = [];
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      urls.push(url);
      return Promise.resolve({ ok: false, status: 401, text: vi.fn().mockResolvedValue('{}') });
    }));

    await new TestGateway().fetchProtected().catch(() => {});

    expect(urls).toContain('http://127.0.0.1:8000/logout');
    expect(window.location.href).toBe('/login');
  });

  it("efface le token en mémoire quand la session expire", async () => {
    tokenStore.set('old.jwt.token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false, status: 401, text: vi.fn().mockResolvedValue('{}'),
    }));

    await new TestGateway().fetchProtected().catch(() => {});

    expect(tokenStore.get()).toBeNull();
  });
});

describe('AbstractHttpGateway — rafraîchissement transparent du token', () => {
  beforeEach(() => {
    tokenStore.clear();
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    tokenStore.clear();
  });

  it('retente la requête si le refresh réussit', async () => {
    let callCount = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1)
        return Promise.resolve({ ok: false, status: 401, text: vi.fn().mockResolvedValue('{}') });
      if (callCount === 2)
        return Promise.resolve({ ok: true, status: 200, text: vi.fn().mockResolvedValue('{}') });
      return Promise.resolve({ ok: true, status: 200, text: vi.fn().mockResolvedValue('{}') });
    }));

    await new TestGateway().fetchProtected();

    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('envoie credentials: include lors de l\'appel au refresh', async () => {
    let callCount = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1)
        return Promise.resolve({ ok: false, status: 401, text: vi.fn().mockResolvedValue('{}') });
      return Promise.resolve({ ok: true, status: 200, text: vi.fn().mockResolvedValue('{}') });
    }));

    await new TestGateway().fetchProtected().catch(() => {});

    const refreshCall = vi.mocked(fetch).mock.calls[1];
    expect(refreshCall[1]).toMatchObject({ credentials: 'include' });
  });

  it('redirige vers /login si le refresh échoue', async () => {
    let callCount = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1)
        return Promise.resolve({ ok: false, status: 401, text: vi.fn().mockResolvedValue('{}') });
      return Promise.resolve({ ok: false, status: 401, text: vi.fn().mockResolvedValue('{}') });
    }));

    await new TestGateway().fetchProtected().catch(() => {});

    expect(window.location.href).toBe('/login');
  });

  it("ne tente pas le refresh depuis une route publique", async () => {
    vi.stubGlobal('fetch', mockFetch(401, JSON.stringify({ message: 'Invalid credentials.' })));

    await new TestGateway().fetchLogin().catch(() => {});

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('stocke le nouveau token en mémoire après un refresh réussi', async () => {
    let callCount = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1)
        return Promise.resolve({ ok: false, status: 401, text: vi.fn().mockResolvedValue('{}') });
      if (callCount === 2)
        return Promise.resolve({
          ok: true, status: 200,
          text: vi.fn().mockResolvedValue(JSON.stringify({ token: 'new.jwt.token' })),
        });
      return Promise.resolve({ ok: true, status: 200, text: vi.fn().mockResolvedValue('{}') });
    }));

    await new TestGateway().fetchProtected();

    expect(tokenStore.get()).toBe('new.jwt.token');
  });
});
