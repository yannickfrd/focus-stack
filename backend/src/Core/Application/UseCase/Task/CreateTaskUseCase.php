<?php

declare(strict_types=1);

namespace App\Core\Application\UseCase\Task;

use App\Core\Domain\Entity\Task\Priority;
use App\Core\Domain\Entity\Task\ScheduledFor;
use App\Core\Domain\Entity\Task\Task;
use App\Core\Domain\Repository\Task\TaskRepositoryInterface;

final readonly class CreateTaskUseCase
{
    public function __construct(
        private TaskRepositoryInterface $taskRepository,
    ) {}

    public function execute(
        string $userId,
        string $title,
        ?string $description,
        Priority $priority,
        ?ScheduledFor $scheduledFor,
        ?string $estimatedTime,
    ): Task {
        $position = $this->taskRepository->countByUserId($userId);

        $task = Task::create(
            title: $title,
            userId: $userId,
            description: $description,
            priority: $priority,
            scheduledFor: $scheduledFor,
            estimatedTime: $estimatedTime,
            position: $position,
        );

        $this->taskRepository->save($task);

        return $task;
    }
}
