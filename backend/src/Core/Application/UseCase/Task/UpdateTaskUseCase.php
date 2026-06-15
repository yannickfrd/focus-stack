<?php

declare(strict_types=1);

namespace App\Core\Application\UseCase\Task;

use App\Core\Domain\Entity\Task\Priority;
use App\Core\Domain\Entity\Task\Task;
use App\Core\Domain\Exception\NotFoundException;
use App\Core\Domain\Repository\Task\TaskRepositoryInterface;

final readonly class UpdateTaskUseCase
{
    public function __construct(
        private TaskRepositoryInterface $taskRepository,
    ) {}

    public function execute(
        int $taskId,
        string $userId,
        ?string $title,
        ?string $description,
        ?Priority $priority,
        ?string $estimatedTime,
    ): Task {
        $task = $this->taskRepository->findByIdAndUserId($taskId, $userId);

        if ($task === null) {
            throw new NotFoundException('Task not found.');
        }

        if ($title !== null) {
            $task->setTitle($title);
        }

        if ($description !== null) {
            $task->setDescription($description);
        }

        if ($priority !== null) {
            $task->setPriority($priority);
        }

        if ($estimatedTime !== null) {
            $task->setEstimatedTime($estimatedTime);
        }

        $this->taskRepository->save($task);

        return $task;
    }
}
