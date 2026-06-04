import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserRegisterHttp } from '@infrastructure/Http/User/UserRegisterHttp';

const BASE_URL = 'http://127.0.0.1:8000';

const mockFetch = (ok: boolean, body: unknown, rejectJson = false) => {
  const json = rejectJson
    ? vi.fn().mockRejectedValue(new SyntaxError('invalid json'))
    : vi.fn().mockResolvedValue(body);

  return vi.fn().mockResolvedValue({ ok, json });
};

describe('UserRegisterHttp', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('register — success', () => {
    it('sends a POST to /register with JSON body and correct headers', async () => {
      const user = { id: 'uuid-1', email: 'new@example.com', createdAt: '2024-01-01T00:00:00Z' };
      vi.stubGlobal('fetch', mockFetch(true, user));

      const repo = new UserRegisterHttp();
      await repo.register({ email: 'new@example.com', password: 'password123' });

      expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: 'new@example.com', password: 'password123' }),
      });
    });

    it('resolves with the user returned by the API', async () => {
      const user = { id: 'uuid-1', email: 'new@example.com', createdAt: '2024-01-01T00:00:00Z' };
      vi.stubGlobal('fetch', mockFetch(true, user));

      const result = await new UserRegisterHttp().register({
        email: 'new@example.com',
        password: 'password123',
      });

      expect(result).toEqual(user);
    });
  });

  describe('register — error cases', () => {
    it('throws with the API error message when the response body contains error', async () => {
      vi.stubGlobal('fetch', mockFetch(false, { error: 'This email is already registered.' }));

      await expect(
        new UserRegisterHttp().register({ email: 'taken@example.com', password: 'pass' })
      ).rejects.toThrow('This email is already registered.');
    });

    it('throws the fallback message when the response body has no error field', async () => {
      vi.stubGlobal('fetch', mockFetch(false, {}));

      await expect(
        new UserRegisterHttp().register({ email: 'x@example.com', password: 'pass' })
      ).rejects.toThrow('Registration failed.');
    });

    it('throws the fallback message when the response body is not valid JSON', async () => {
      vi.stubGlobal('fetch', mockFetch(false, null, true));

      await expect(
        new UserRegisterHttp().register({ email: 'x@example.com', password: 'pass' })
      ).rejects.toThrow('Registration failed.');
    });
  });
});
