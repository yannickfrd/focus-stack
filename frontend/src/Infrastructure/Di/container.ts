import { createContainer, asClass, InjectionMode } from 'awilix';
import { UserRegisterHttpGateway } from '@infrastructure/Http/User/UserRegisterHttpGateway';
import { UserLoginHttpGateway } from '@infrastructure/Http/User/UserLoginHttpGateway';
import { UserLogoutHttpGateway } from '@infrastructure/Http/User/UserLogoutHttpGateway';
import { TokenRefreshHttpGateway } from '@infrastructure/Http/Auth/TokenRefreshHttpGateway';
import { RegisterUserUseCase } from '@application/UseCases/User/RegisterUserUseCase';
import { LoginUserUseCase } from '@application/UseCases/User/LoginUserUseCase';
import { LogoutUserUseCase } from '@application/UseCases/User/LogoutUserUseCase';
import { RefreshTokenUseCase } from '@application/UseCases/Auth/RefreshTokenUseCase';

const container = createContainer({ injectionMode: InjectionMode.PROXY });

container.register({
  userRegisterPort:    asClass(UserRegisterHttpGateway).singleton(),
  userLoginPort:       asClass(UserLoginHttpGateway).singleton(),
  userLogoutPort:      asClass(UserLogoutHttpGateway).singleton(),
  tokenRefreshPort:    asClass(TokenRefreshHttpGateway).singleton(),
  registerUserUseCase: asClass(RegisterUserUseCase).singleton(),
  loginUserUseCase:    asClass(LoginUserUseCase).singleton(),
  logoutUserUseCase:   asClass(LogoutUserUseCase).singleton(),
  refreshTokenUseCase: asClass(RefreshTokenUseCase).singleton(),
});

export { container };
