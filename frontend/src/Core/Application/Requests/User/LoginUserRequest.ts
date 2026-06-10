export class LoginUserRequest {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}
