import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserRegisterHttpGateway } from '@infrastructure/Http/User/UserRegisterHttpGateway';

const BASE_URL = 'http://127.0.0.1:8000';

const mockFetch = (status: number, body: string | null = null, rejectText = false) => {
  const text = rejectText
    ? vi.fn().mockRejectedValue(new Error('network error'))
    : vi.fn().mockResolvedValue(body ?? '');

  return vi.fn().mockResolvedValue({ ok: status >= 200 && status < 300, status, text });
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
      vi.stubGlobal('fetch', mockFetch(204));

      await new UserRegisterHttpGateway().register({ email: 'new@example.com', password: 'password123' });

      expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: 'new@example.com', password: 'password123' }),
      });
    });

    it('résout sans valeur sur un 204 No Content', async () => {
      vi.stubGlobal('fetch', mockFetch(204));

      const result = await new UserRegisterHttpGateway().register({
        email: 'new@example.com',
        password: 'password123',
      });

      expect(result).toBeUndefined();
    });
  });

  describe("register — cas d'erreur", () => {
    it("lève l'erreur API quand le corps contient un champ error", async () => {
      vi.stubGlobal('fetch', mockFetch(409, JSON.stringify({ error: 'Cette adresse email est déjà utilisée.' })));

      await expect(
        new UserRegisterHttpGateway().register({ email: 'taken@example.com', password: 'pass' })
      ).rejects.toThrow('Cette adresse email est déjà utilisée.');
    });

    it('lève le message par défaut quand le corps ne contient pas de champ error', async () => {
      vi.stubGlobal('fetch', mockFetch(400, '{}'));

      await expect(
        new UserRegisterHttpGateway().register({ email: 'x@example.com', password: 'pass' })
      ).rejects.toThrow('Request failed.');
    });

    it('lève le message par défaut quand le corps est vide', async () => {
      vi.stubGlobal('fetch', mockFetch(400, ''));

      await expect(
        new UserRegisterHttpGateway().register({ email: 'x@example.com', password: 'pass' })
      ).rejects.toThrow('Request failed.');
    });
  });
});
