<?php

declare(strict_types=1);

namespace App\Core\Application\UseCase\Task;

use App\Core\Domain\Entity\Task\Task;
use App\Core\Domain\Repository\Task\TaskRepositoryInterface;

final readonly class ListTasksUseCase
{
    public function __construct(
        private TaskRepositoryInterface $taskRepository,
    ) {}

    /** @return Task[] */
    public function execute(string $userId): array
    {
        return $this->taskRepository->findAllByUserId($userId);
    }
}
