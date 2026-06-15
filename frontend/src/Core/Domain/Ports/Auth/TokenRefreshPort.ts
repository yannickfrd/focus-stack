export interface RefreshTokenResult {
  token: string;
}

export interface TokenRefreshPort {
  refresh(): Promise<RefreshTokenResult>;
}
