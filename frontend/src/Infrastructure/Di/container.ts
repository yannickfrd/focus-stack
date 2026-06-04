import { createContainer, asClass, InjectionMode } from 'awilix';
import { UserRegisterHttp } from '@infrastructure/Http/User/UserRegisterHttp';
import { RegisterUserUseCase } from '@application/UseCases/User/RegisterUserUseCase';
import { CookieAuthTokenAdapter } from '@infrastructure/Storage/CookieAuthTokenAdapter';

const container = createContainer({ injectionMode: InjectionMode.CLASSIC });

container.register({
  userRepository:      asClass(UserRegisterHttp).singleton(),
  registerUserUseCase: asClass(RegisterUserUseCase).singleton(),
  authToken:           asClass(CookieAuthTokenAdapter).singleton(),
});

export { container };
