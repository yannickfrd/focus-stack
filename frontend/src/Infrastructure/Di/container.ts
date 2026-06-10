import { createContainer, asClass, InjectionMode } from 'awilix';
import { UserRegisterHttpGateway } from '@infrastructure/Http/User/UserRegisterHttpGateway';
import { UserLoginHttpGateway } from '@infrastructure/Http/User/UserLoginHttpGateway';
import { RegisterUserUseCase } from '@application/UseCases/User/RegisterUserUseCase';
import { LoginUserUseCase } from '@application/UseCases/User/LoginUserUseCase';
import { CookieAuthTokenAdapter } from '@infrastructure/Storage/CookieAuthTokenAdapter';

const container = createContainer({ injectionMode: InjectionMode.CLASSIC });

container.register({
  userRegisterPort: asClass(UserRegisterHttpGateway).singleton(),
  userLoginPort:    asClass(UserLoginHttpGateway).singleton(),
  registerUserUseCase: asClass(RegisterUserUseCase).singleton(),
  loginUserUseCase:    asClass(LoginUserUseCase).singleton(),
  authToken:           asClass(CookieAuthTokenAdapter).singleton(),
});

export { container };
