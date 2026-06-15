import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserLogoutHttpGateway } from '@infrastructure/Http/User/UserLogoutHttpGateway';

const BASE_URL = 'http://127.0.0.1:8000';

const mockFetch = (status: number, body = '') =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: vi.fn().mockResolvedValue(body),
  });

describe('UserLogoutHttpGateway', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('logout — succès', () => {
    it('envoie un POST à /logout avec credentials: include', async () => {
      vi.stubGlobal('fetch', mockFetch(204));

      await new UserLogoutHttpGateway().logout();

      expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });
    });

    it('résout sans valeur de retour (204 No Content)', async () => {
      vi.stubGlobal('fetch', mockFetch(204));

      const result = await new UserLogoutHttpGateway().logout();

      expect(result).toBeUndefined();
    });
  });

  describe("logout — cas d'erreur", () => {
    it('lève une erreur quand le corps contient un champ message', async () => {
      vi.stubGlobal('fetch', mockFetch(401, JSON.stringify({ message: 'JWT Token not found' })));

      await expect(new UserLogoutHttpGateway().logout()).rejects.toThrow('JWT Token not found');
    });

    it('lève le message par défaut quand le corps est vide', async () => {
      vi.stubGlobal('fetch', mockFetch(500, ''));

      await expect(new UserLogoutHttpGateway().logout()).rejects.toThrow('Request failed.');
    });
  });
});
