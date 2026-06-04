export interface AuthTokenPort {
  store(userId: string): void;
  clear(): void;
}
