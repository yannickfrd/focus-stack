<?php

declare(strict_types=1);

namespace App\Core\Application\UseCase\Task;

use App\Core\Domain\Repository\Task\TaskRepositoryInterface;

final readonly class ReorderTasksUseCase
{
    public function __construct(
        private TaskRepositoryInterface $taskRepository,
    ) {}

    /** @param string[] $ids */
    public function execute(array $ids, string $userId): void
    {
        $taskList = $this->taskRepository->findAllByUserId($userId);
        $taskList->reorder($ids);
        $this->taskRepository->saveAll($taskList);
    }
}
