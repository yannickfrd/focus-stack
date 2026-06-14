import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TokenRefreshHttpGateway } from '@infrastructure/Http/Auth/TokenRefreshHttpGateway';

const BASE_URL = 'http://127.0.0.1:8000';

const mockFetch = (status: number, body = '') =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: vi.fn().mockResolvedValue(body),
  });

describe('TokenRefreshHttpGateway', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('refresh — succès', () => {
    it('envoie un POST à /token/refresh avec credentials: include et sans corps', async () => {
      vi.stubGlobal('fetch', mockFetch(200));

      await new TokenRefreshHttpGateway().refresh();

      expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });
    });

    it('résout sans valeur de retour', async () => {
      vi.stubGlobal('fetch', mockFetch(200));

      const result = await new TokenRefreshHttpGateway().refresh();

      expect(result).toBeUndefined();
    });
  });

  describe("refresh — cas d'erreur", () => {
    it('lève le message de l\'API quand le corps contient un champ error', async () => {
      vi.stubGlobal('fetch', mockFetch(401, JSON.stringify({ error: 'Refresh token invalide.' })));

      await expect(new TokenRefreshHttpGateway().refresh()).rejects.toThrow('Refresh token invalide.');
    });

    it('lève le message par défaut quand le corps est vide', async () => {
      vi.stubGlobal('fetch', mockFetch(401, ''));

      await expect(new TokenRefreshHttpGateway().refresh()).rejects.toThrow('Request failed.');
    });
  });
});
