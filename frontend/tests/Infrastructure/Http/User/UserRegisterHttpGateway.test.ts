import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserRegisterHttpGateway } from '@infrastructure/Http/User/UserRegisterHttpGateway';

const BASE_URL = 'http://127.0.0.1:8000';

const mockFetch = (ok: boolean, body: unknown, rejectJson = false) => {
  const json = rejectJson
    ? vi.fn().mockRejectedValue(new SyntaxError('invalid json'))
    : vi.fn().mockResolvedValue(body);

  return vi.fn().mockResolvedValue({ ok, json });
};

describe('UserRegisterHttpGateway', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('register — succès', () => {
    it('envoie un POST à /register avec le corps JSON et les bons headers', async () => {
      const user = { id: 'uuid-1', email: 'new@example.com', createdAt: '2024-01-01T00:00:00Z' };
      vi.stubGlobal('fetch', mockFetch(true, user));

      const gateway = new UserRegisterHttpGateway();
      await gateway.register({ email: 'new@example.com', password: 'password123' });

      expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: 'new@example.com', password: 'password123' }),
      });
    });

    it("résout avec l'utilisateur retourné par l'API", async () => {
      const user = { id: 'uuid-1', email: 'new@example.com', createdAt: '2024-01-01T00:00:00Z' };
      vi.stubGlobal('fetch', mockFetch(true, user));

      const result = await new UserRegisterHttpGateway().register({
        email: 'new@example.com',
        password: 'password123',
      });

      expect(result).toEqual(user);
    });
  });

  describe("register — cas d'erreur", () => {
    it("lève l'erreur API quand le corps contient un champ error", async () => {
      vi.stubGlobal('fetch', mockFetch(false, { error: 'Cette adresse email est déjà utilisée.' }));

      await expect(
        new UserRegisterHttpGateway().register({ email: 'taken@example.com', password: 'pass' })
      ).rejects.toThrow('Cette adresse email est déjà utilisée.');
    });

    it('lève le message par défaut quand le corps ne contient pas de champ error', async () => {
      vi.stubGlobal('fetch', mockFetch(false, {}));

      await expect(
        new UserRegisterHttpGateway().register({ email: 'x@example.com', password: 'pass' })
      ).rejects.toThrow('Request failed.');
    });

    it('lève le message par défaut quand le corps JSON est invalide', async () => {
      vi.stubGlobal('fetch', mockFetch(false, null, true));

      await expect(
        new UserRegisterHttpGateway().register({ email: 'x@example.com', password: 'pass' })
      ).rejects.toThrow('Request failed.');
    });
  });
});
