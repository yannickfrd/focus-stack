<?php

declare(strict_types=1);

namespace App\Core\Application\UseCase\Task;

use App\Core\Domain\Entity\Task\Task;
use App\Core\Domain\Exception\NotFoundException;
use App\Core\Domain\Repository\Task\TaskRepositoryInterface;

final readonly class ToggleTaskUseCase
{
    public function __construct(
        private TaskRepositoryInterface $taskRepository,
    ) {}

    public function execute(int $taskId, string $userId): Task
    {
        $task = $this->taskRepository->findByIdAndUserId($taskId, $userId);

        if ($task === null) {
            throw new NotFoundException('Task not found.');
        }

        $task->setDone(!$task->isDone());
        $this->taskRepository->save($task);

        return $task;
    }
}
