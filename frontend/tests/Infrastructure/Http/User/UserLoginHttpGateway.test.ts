import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserLoginHttpGateway } from '@infrastructure/Http/User/UserLoginHttpGateway';

const BASE_URL = 'http://127.0.0.1:8000';

const mockFetch = (status: number, body: string | null = null, rejectText = false) => {
  const text = rejectText
    ? vi.fn().mockRejectedValue(new Error('network error'))
    : vi.fn().mockResolvedValue(body ?? '');

  return vi.fn().mockResolvedValue({ ok: status >= 200 && status < 300, status, text });
};

const loginResponse = JSON.stringify({
  token: 'jwt.access.token',
  user: { id: 'uuid-1', email: 'user@example.com' },
});

describe('UserLoginHttpGateway', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('login — succès', () => {
    it('envoie un POST à /login avec credentials: include et les bons headers', async () => {
      vi.stubGlobal('fetch', mockFetch(200, loginResponse));

      await new UserLoginHttpGateway().login({ email: 'user@example.com', password: 'password123' });

      expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: 'user@example.com', password: 'password123' }),
      });
    });

    it("résout avec l'utilisateur retourné par l'API", async () => {
      vi.stubGlobal('fetch', mockFetch(200, loginResponse));

      const result = await new UserLoginHttpGateway().login({
        email: 'user@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ token: 'jwt.access.token', user: { id: 'uuid-1', email: 'user@example.com' } });
    });
  });

  describe("login — cas d'erreur", () => {
    it("lève le message de l'API quand le corps contient un champ message (format Lexik JWT)", async () => {
      vi.stubGlobal('fetch', mockFetch(401, JSON.stringify({ code: 401, message: 'Invalid credentials.' })));

      await expect(
        new UserLoginHttpGateway().login({ email: 'bad@example.com', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials.');
    });

    it("lève l'erreur API quand le corps contient un champ error", async () => {
      vi.stubGlobal('fetch', mockFetch(400, JSON.stringify({ error: 'Identifiants invalides.' })));

      await expect(
        new UserLoginHttpGateway().login({ email: 'bad@example.com', password: 'wrong' })
      ).rejects.toThrow('Identifiants invalides.');
    });

    it('lève le message par défaut quand le corps ne contient ni error ni message', async () => {
      vi.stubGlobal('fetch', mockFetch(400, '{}'));

      await expect(
        new UserLoginHttpGateway().login({ email: 'x@example.com', password: 'pass' })
      ).rejects.toThrow('Request failed.');
    });

    it('lève le message par défaut quand le corps est vide', async () => {
      vi.stubGlobal('fetch', mockFetch(400, ''));

      await expect(
        new UserLoginHttpGateway().login({ email: 'x@example.com', password: 'pass' })
      ).rejects.toThrow('Request failed.');
    });
  });
});
