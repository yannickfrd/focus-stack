export interface TokenRefreshPort {
  refresh(): Promise<void>;
}
