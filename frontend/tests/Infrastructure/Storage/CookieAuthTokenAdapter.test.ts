import { describe, it, expect, beforeEach } from 'vitest';
import { CookieAuthTokenAdapter } from '@infrastructure/Storage/CookieAuthTokenAdapter';

const getSessionCookie = () =>
  document.cookie
    .split('; ')
    .find((c) => c.startsWith('session='))
    ?.split('=')[1];

describe('CookieAuthTokenAdapter', () => {
  let adapter: CookieAuthTokenAdapter;

  beforeEach(() => {
    adapter = new CookieAuthTokenAdapter();
    // Clear session cookie before each test
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  describe('store', () => {
    it('sets the session cookie with the given userId', () => {
      adapter.store('user-abc-123');

      expect(getSessionCookie()).toBe('user-abc-123');
    });

    it('overwrites an existing session cookie', () => {
      adapter.store('old-user');
      adapter.store('new-user');

      expect(getSessionCookie()).toBe('new-user');
    });
  });

  describe('clear', () => {
    it('removes the session cookie', () => {
      adapter.store('user-abc-123');
      adapter.clear();

      expect(getSessionCookie()).toBeUndefined();
    });

    it('does not throw when there is no cookie to clear', () => {
      expect(() => adapter.clear()).not.toThrow();
    });
  });
});
