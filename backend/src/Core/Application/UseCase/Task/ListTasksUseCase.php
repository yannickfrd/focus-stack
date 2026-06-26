<?php

declare(strict_types=1);

namespace App\Core\Application\UseCase\Task;

use App\Core\Domain\Entity\Task\TaskList;
use App\Core\Domain\Repository\Task\TaskRepositoryInterface;

final readonly class ListTasksUseCase
{
    public function __construct(
        private TaskRepositoryInterface $taskRepository,
    ) {}

    public function execute(string $userId): TaskList
    {
        return $this->taskRepository->findAllByUserId($userId);
    }
}
