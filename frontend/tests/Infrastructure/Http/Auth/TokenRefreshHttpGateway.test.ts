import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TokenRefreshHttpGateway } from '@infrastructure/Http/Auth/TokenRefreshHttpGateway';

const BASE_URL = 'http://127.0.0.1:8000';

const mockFetch = (status: number, body = '') =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: vi.fn().mockResolvedValue(body),
  });

const refreshResponse = JSON.stringify({
  token: 'new.access.token',
  refresh_token: 'new.refresh.token',
});

describe('TokenRefreshHttpGateway', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('refresh — succès', () => {
    it('envoie un POST à /token/refresh sans header Authorization (route publique)', async () => {
      vi.stubGlobal('fetch', mockFetch(200, refreshResponse));
      document.cookie = 'session=expired.token; path=/';

      await new TokenRefreshHttpGateway().refresh('old.refresh.token');

      expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refresh_token: 'old.refresh.token' }),
      });
    });

    it('résout avec le nouveau token et le nouveau refresh token', async () => {
      vi.stubGlobal('fetch', mockFetch(200, refreshResponse));

      const result = await new TokenRefreshHttpGateway().refresh('old.refresh.token');

      expect(result).toEqual({ token: 'new.access.token', refresh_token: 'new.refresh.token' });
    });
  });

  describe("refresh — cas d'erreur", () => {
    it('lève le message de l\'API quand le corps contient un champ error', async () => {
      vi.stubGlobal('fetch', mockFetch(401, JSON.stringify({ error: 'Refresh token invalide.' })));

      await expect(
        new TokenRefreshHttpGateway().refresh('bad.refresh')
      ).rejects.toThrow('Refresh token invalide.');
    });

    it('lève le message par défaut quand le corps est vide', async () => {
      vi.stubGlobal('fetch', mockFetch(401, ''));

      await expect(
        new TokenRefreshHttpGateway().refresh('bad.refresh')
      ).rejects.toThrow('Request failed.');
    });

    it('lève le message par défaut quand le corps ne contient ni error ni message', async () => {
      vi.stubGlobal('fetch', mockFetch(401, '{}'));

      await expect(
        new TokenRefreshHttpGateway().refresh('bad.refresh')
      ).rejects.toThrow('Request failed.');
    });
  });
});
