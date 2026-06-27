import { createContainer, asClass, InjectionMode } from 'awilix';
import { UserRegisterHttpGateway } from '@infrastructure/Http/User/UserRegisterHttpGateway';
import { UserLoginHttpGateway } from '@infrastructure/Http/User/UserLoginHttpGateway';
import { UserLogoutHttpGateway } from '@infrastructure/Http/User/UserLogoutHttpGateway';
import { TokenRefreshHttpGateway } from '@infrastructure/Http/Auth/TokenRefreshHttpGateway';
import { TaskHttpGateway } from '@infrastructure/Http/Task/TaskHttpGateway';
import { FocusTimeHttpGateway } from '@infrastructure/Http/FocusTime/FocusTimeHttpGateway';
import { RoutineHttpGateway } from '@infrastructure/Http/Routine/RoutineHttpGateway';
import { RegisterUserUseCase } from '@application/UseCases/User/RegisterUserUseCase';
import { LoginUserUseCase } from '@application/UseCases/User/LoginUserUseCase';
import { LogoutUserUseCase } from '@application/UseCases/User/LogoutUserUseCase';
import { RefreshTokenUseCase } from '@application/UseCases/Auth/RefreshTokenUseCase';
import { GetTasksUseCase } from '@application/UseCases/Task/GetTasksUseCase';
import { CreateTaskUseCase } from '@application/UseCases/Task/CreateTaskUseCase';
import { UpdateTaskUseCase } from '@application/UseCases/Task/UpdateTaskUseCase';
import { ReorderTasksUseCase } from '@application/UseCases/Task/ReorderTasksUseCase';
import { DeleteTaskUseCase } from '@application/UseCases/Task/DeleteTaskUseCase';
import { CreateFocusTimeUseCase } from '@application/UseCases/FocusTime/CreateFocusTimeUseCase';
import { ListFocusTimesUseCase } from '@application/UseCases/FocusTime/ListFocusTimesUseCase';
import { GetRoutinesUseCase } from '@application/UseCases/Routine/GetRoutinesUseCase';
import { CreateRoutineUseCase } from '@application/UseCases/Routine/CreateRoutineUseCase';
import { UpdateRoutineUseCase } from '@application/UseCases/Routine/UpdateRoutineUseCase';
import { DeleteRoutineUseCase } from '@application/UseCases/Routine/DeleteRoutineUseCase';

const container = createContainer({ injectionMode: InjectionMode.PROXY });

container.register({
  userRegisterPort:    asClass(UserRegisterHttpGateway).singleton(),
  userLoginPort:       asClass(UserLoginHttpGateway).singleton(),
  userLogoutPort:      asClass(UserLogoutHttpGateway).singleton(),
  tokenRefreshPort:    asClass(TokenRefreshHttpGateway).singleton(),
  taskPort:            asClass(TaskHttpGateway).singleton(),
  focusTimePort:       asClass(FocusTimeHttpGateway).singleton(),
  registerUserUseCase: asClass(RegisterUserUseCase).singleton(),
  loginUserUseCase:    asClass(LoginUserUseCase).singleton(),
  logoutUserUseCase:   asClass(LogoutUserUseCase).singleton(),
  refreshTokenUseCase: asClass(RefreshTokenUseCase).singleton(),
  getTasksUseCase:     asClass(GetTasksUseCase).singleton(),
  createTaskUseCase:   asClass(CreateTaskUseCase).singleton(),
  updateTaskUseCase:   asClass(UpdateTaskUseCase).singleton(),
  reorderTasksUseCase: asClass(ReorderTasksUseCase).singleton(),
  deleteTaskUseCase:       asClass(DeleteTaskUseCase).singleton(),
  createFocusTimeUseCase:  asClass(CreateFocusTimeUseCase).singleton(),
  listFocusTimesUseCase:   asClass(ListFocusTimesUseCase).singleton(),
  routinePort:             asClass(RoutineHttpGateway).singleton(),
  getRoutinesUseCase:      asClass(GetRoutinesUseCase).singleton(),
  createRoutineUseCase:    asClass(CreateRoutineUseCase).singleton(),
  updateRoutineUseCase:    asClass(UpdateRoutineUseCase).singleton(),
  deleteRoutineUseCase:    asClass(DeleteRoutineUseCase).singleton(),
});

export { container };
