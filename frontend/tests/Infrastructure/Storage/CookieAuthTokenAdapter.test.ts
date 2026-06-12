import { describe, it, expect, beforeEach } from 'vitest';
import { CookieAuthTokenAdapter } from '@infrastructure/Storage/CookieAuthTokenAdapter';

const getCookie = (name: string) =>
  document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${name}=`))
    ?.split('=')[1];

describe('CookieAuthTokenAdapter', () => {
  let adapter: CookieAuthTokenAdapter;

  beforeEach(() => {
    adapter = new CookieAuthTokenAdapter();
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  describe('store', () => {
    it('sets the session cookie with the given token', () => {
      adapter.store('user-abc-123');

      expect(getCookie('session')).toBe('user-abc-123');
    });

    it('overwrites an existing session cookie', () => {
      adapter.store('old-token');
      adapter.store('new-token');

      expect(getCookie('session')).toBe('new-token');
    });
  });

  describe('clear', () => {
    it('removes the session cookie', () => {
      adapter.store('user-abc-123');
      adapter.clear();

      expect(getCookie('session')).toBeUndefined();
    });

    it('does not throw when there is no cookie to clear', () => {
      expect(() => adapter.clear()).not.toThrow();
    });
  });

  describe('storeRefreshToken', () => {
    it('sets the refresh_token cookie with the given token', () => {
      adapter.storeRefreshToken('refresh.abc.123');

      expect(getCookie('refresh_token')).toBe('refresh.abc.123');
    });

    it('overwrites an existing refresh_token cookie', () => {
      adapter.storeRefreshToken('old.refresh');
      adapter.storeRefreshToken('new.refresh');

      expect(getCookie('refresh_token')).toBe('new.refresh');
    });
  });

  describe('clearRefreshToken', () => {
    it('removes the refresh_token cookie', () => {
      adapter.storeRefreshToken('refresh.abc.123');
      adapter.clearRefreshToken();

      expect(getCookie('refresh_token')).toBeUndefined();
    });

    it('does not throw when there is no refresh_token cookie to clear', () => {
      expect(() => adapter.clearRefreshToken()).not.toThrow();
    });
  });
});
