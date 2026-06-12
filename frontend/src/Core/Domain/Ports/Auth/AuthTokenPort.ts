export interface AuthTokenPort {
  store(token: string): void;
  clear(): void;
  storeRefreshToken(token: string): void;
  clearRefreshToken(): void;
}
