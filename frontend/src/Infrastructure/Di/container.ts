import { createContainer, asClass, InjectionMode } from 'awilix';
import { UserRegisterHttpGateway } from '@infrastructure/Http/User/UserRegisterHttpGateway';
import { RegisterUserUseCase } from '@application/UseCases/User/RegisterUserUseCase';
import { CookieAuthTokenAdapter } from '@infrastructure/Storage/CookieAuthTokenAdapter';

const container = createContainer({ injectionMode: InjectionMode.CLASSIC });

container.register({
  userRepository:      asClass(UserRegisterHttpGateway).singleton(),
  registerUserUseCase: asClass(RegisterUserUseCase).singleton(),
  authToken:           asClass(CookieAuthTokenAdapter).singleton(),
});

export { container };
