export interface TokenRefreshResult {
  token: string;
  refresh_token: string;
}

export interface TokenRefreshPort {
  refresh(refreshToken: string): Promise<TokenRefreshResult>;
}
