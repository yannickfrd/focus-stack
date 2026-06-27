<?php

declare(strict_types=1);

namespace App\UserInterface\Controller;

use App\Core\Application\UseCase\Routine\CreateRoutineUseCase;
use App\Core\Application\UseCase\Routine\DeleteRoutineUseCase;
use App\Core\Application\UseCase\Routine\ListRoutinesUseCase;
use App\Core\Application\UseCase\Routine\UpdateRoutineUseCase;
use App\Infrastructure\Persistence\Doctrine\Entity\UserEntity;
use App\UserInterface\DTO\Routine\CreateRoutineRequestDTO;
use App\UserInterface\DTO\Routine\UpdateRoutineRequestDTO;
use App\UserInterface\Presenter\Routine\RoutinePresenter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

final class RoutineController extends AbstractController
{
    public function __construct(
        private readonly CreateRoutineUseCase $createRoutineUseCase,
        private readonly ListRoutinesUseCase $listRoutinesUseCase,
        private readonly UpdateRoutineUseCase $updateRoutineUseCase,
        private readonly DeleteRoutineUseCase $deleteRoutineUseCase,
        private readonly RoutinePresenter $routinePresenter,
    ) {}

    #[Route('/routines', name: 'routine_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        /** @var UserEntity $user */
        $user = $this->getUser();

        $routines = $this->listRoutinesUseCase->execute($user->getId());

        return $this->json($this->routinePresenter->presentAll($routines));
    }

    #[Route('/routines', name: 'routine_create', methods: ['POST'])]
    public function create(#[MapRequestPayload] CreateRoutineRequestDTO $request): JsonResponse
    {
        /** @var UserEntity $user */
        $user = $this->getUser();

        $routine = $this->createRoutineUseCase->execute(
            userId: $user->getId(),
            request: $request->toRequest(),
        );

        return $this->json($this->routinePresenter->present($routine), Response::HTTP_CREATED);
    }

    #[Route('/routines/{id}', name: 'routine_update', methods: ['PATCH'])]
    public function update(string $id, #[MapRequestPayload] UpdateRoutineRequestDTO $request): JsonResponse
    {
        /** @var UserEntity $user */
        $user = $this->getUser();

        $routine = $this->updateRoutineUseCase->execute(
            routineId: $id,
            userId: $user->getId(),
            request: $request->toRequest(),
        );

        return $this->json($this->routinePresenter->present($routine));
    }

    #[Route('/routines/{id}', name: 'routine_delete', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        /** @var UserEntity $user */
        $user = $this->getUser();

        $this->deleteRoutineUseCase->execute($id, $user->getId());

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
