import { createContainer, asClass, InjectionMode } from 'awilix';
import { UserRegisterHttpGateway } from '@infrastructure/Http/User/UserRegisterHttpGateway';
import { UserLoginHttpGateway } from '@infrastructure/Http/User/UserLoginHttpGateway';
import { UserLogoutHttpGateway } from '@infrastructure/Http/User/UserLogoutHttpGateway';
import { RegisterUserUseCase } from '@application/UseCases/User/RegisterUserUseCase';
import { LoginUserUseCase } from '@application/UseCases/User/LoginUserUseCase';
import { LogoutUserUseCase } from '@application/UseCases/User/LogoutUserUseCase';
import { CookieAuthTokenAdapter } from '@infrastructure/Storage/CookieAuthTokenAdapter';

const container = createContainer({ injectionMode: InjectionMode.CLASSIC });

container.register({
  userRegisterPort: asClass(UserRegisterHttpGateway).singleton(),
  userLoginPort:    asClass(UserLoginHttpGateway).singleton(),
  userLogoutPort:   asClass(UserLogoutHttpGateway).singleton(),
  registerUserUseCase: asClass(RegisterUserUseCase).singleton(),
  loginUserUseCase:    asClass(LoginUserUseCase).singleton(),
  logoutUserUseCase:   asClass(LogoutUserUseCase).singleton(),
  authToken:           asClass(CookieAuthTokenAdapter).singleton(),
});

export { container };
