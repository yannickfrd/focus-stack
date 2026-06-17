<?php

declare(strict_types=1);

namespace App\Core\Application\UseCase\Task;

use App\Core\Application\Request\Task\CreateTaskRequest;
use App\Core\Domain\Entity\Task\Task;
use App\Core\Domain\Repository\Task\TaskRepositoryInterface;

final readonly class CreateTaskUseCase
{
    public function __construct(
        private TaskRepositoryInterface $taskRepository,
    ) {}

    public function execute(string $userId, CreateTaskRequest $request): Task
    {
        $position = $this->taskRepository->countByUserId($userId);

        $task = Task::create(
            title: $request->title,
            userId: $userId,
            description: $request->description,
            priority: $request->priority,
            scheduledFor: $request->scheduledFor,
            estimatedTime: $request->estimatedTime,
            position: $position,
        );

        $this->taskRepository->save($task);

        return $task;
    }
}
