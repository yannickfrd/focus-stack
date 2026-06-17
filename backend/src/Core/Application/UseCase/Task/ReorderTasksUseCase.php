<?php

declare(strict_types=1);

namespace App\Core\Application\UseCase\Task;

use App\Core\Domain\Exception\NotFoundException;
use App\Core\Domain\Repository\Task\TaskRepositoryInterface;

final readonly class ReorderTasksUseCase
{
    public function __construct(
        private TaskRepositoryInterface $taskRepository,
    ) {}

    /** @param int[] $ids */
    public function execute(array $ids, string $userId): void
    {
        $tasks = $this->taskRepository->findAllByUserId($userId);

        $taskMap = [];
        foreach ($tasks as $task) {
            $taskMap[$task->getId()] = $task;
        }

        $toSave = [];
        foreach ($ids as $position => $id) {
            if (!isset($taskMap[$id])) {
                throw new NotFoundException("Task {$id} not found.");
            }
            $taskMap[$id]->setPosition($position);
            $toSave[] = $taskMap[$id];
        }

        $this->taskRepository->saveAll($toSave);
    }
}
