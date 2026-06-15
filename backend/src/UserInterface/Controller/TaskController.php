<?php

declare(strict_types=1);

namespace App\UserInterface\Controller;

use App\Core\Application\UseCase\Task\CreateTaskUseCase;
use App\Core\Application\UseCase\Task\DeleteTaskUseCase;
use App\Core\Application\UseCase\Task\ListTasksUseCase;
use App\Core\Application\UseCase\Task\PostponeTaskUseCase;
use App\Core\Application\UseCase\Task\ReorderTasksUseCase;
use App\Core\Application\UseCase\Task\ToggleTaskUseCase;
use App\Core\Application\UseCase\Task\UpdateTaskUseCase;
use App\Core\Domain\Entity\Task\Priority;
use App\Core\Domain\Entity\Task\ScheduledFor;
use App\Infrastructure\Persistence\Doctrine\Entity\UserEntity;
use App\UserInterface\DTO\Task\CreateTaskRequest;
use App\UserInterface\DTO\Task\ReorderTasksRequest;
use App\UserInterface\DTO\Task\UpdateTaskRequest;
use App\UserInterface\Presenter\Task\TaskPresenter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

final class TaskController extends AbstractController
{
    public function __construct(
        private readonly CreateTaskUseCase $createTaskUseCase,
        private readonly ListTasksUseCase $listTasksUseCase,
        private readonly UpdateTaskUseCase $updateTaskUseCase,
        private readonly ToggleTaskUseCase $toggleTaskUseCase,
        private readonly PostponeTaskUseCase $postponeTaskUseCase,
        private readonly ReorderTasksUseCase $reorderTasksUseCase,
        private readonly DeleteTaskUseCase $deleteTaskUseCase,
        private readonly TaskPresenter $taskPresenter,
    ) {}

    #[Route('/tasks', name: 'task_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        /** @var UserEntity $user */
        $user = $this->getUser();

        $tasks = $this->listTasksUseCase->execute($user->getId());

        return $this->json($this->taskPresenter->presentAll($tasks));
    }

    #[Route('/tasks', name: 'task_create', methods: ['POST'])]
    public function create(#[MapRequestPayload] CreateTaskRequest $request): JsonResponse
    {
        /** @var UserEntity $user */
        $user = $this->getUser();

        $task = $this->createTaskUseCase->execute(
            userId: $user->getId(),
            title: $request->title,
            description: $request->description,
            priority: Priority::from($request->priority),
            scheduledFor: $request->scheduledFor !== null ? ScheduledFor::from($request->scheduledFor) : null,
            estimatedTime: $request->estimatedTime,
        );

        return $this->json($this->taskPresenter->present($task), Response::HTTP_CREATED);
    }

    #[Route('/tasks/{id}', name: 'task_update', methods: ['PATCH'])]
    public function update(int $id, #[MapRequestPayload] UpdateTaskRequest $request): JsonResponse
    {
        /** @var UserEntity $user */
        $user = $this->getUser();

        $task = $this->updateTaskUseCase->execute(
            taskId: $id,
            userId: $user->getId(),
            title: $request->title,
            description: $request->description,
            priority: $request->priority !== null ? Priority::from($request->priority) : null,
            estimatedTime: $request->estimatedTime,
        );

        return $this->json($this->taskPresenter->present($task));
    }

    #[Route('/tasks/{id}/toggle', name: 'task_toggle', methods: ['PATCH'])]
    public function toggle(int $id): JsonResponse
    {
        /** @var UserEntity $user */
        $user = $this->getUser();

        $task = $this->toggleTaskUseCase->execute($id, $user->getId());

        return $this->json($this->taskPresenter->present($task));
    }

    #[Route('/tasks/{id}/postpone', name: 'task_postpone', methods: ['PATCH'])]
    public function postpone(int $id): JsonResponse
    {
        /** @var UserEntity $user */
        $user = $this->getUser();

        $task = $this->postponeTaskUseCase->execute($id, $user->getId());

        return $this->json($this->taskPresenter->present($task));
    }

    #[Route('/tasks/reorder', name: 'task_reorder', methods: ['PUT'])]
    public function reorder(#[MapRequestPayload] ReorderTasksRequest $request): JsonResponse
    {
        /** @var UserEntity $user */
        $user = $this->getUser();

        $this->reorderTasksUseCase->execute($request->ids, $user->getId());

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/tasks/{id}', name: 'task_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        /** @var UserEntity $user */
        $user = $this->getUser();

        $this->deleteTaskUseCase->execute($id, $user->getId());

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
