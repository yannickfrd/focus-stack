<?php

declare(strict_types=1);

namespace App\Core\Domain\Repository\Task;

use App\Core\Domain\Entity\Task\Task;

interface TaskRepositoryInterface
{
    public function save(Task $task): void;

    /** @param Task[] $tasks */
    public function saveAll(array $tasks): void;

    public function findByIdAndUserId(int $id, string $userId): ?Task;

    /** @return Task[] */
    public function findAllByUserId(string $userId): array;

    public function countByUserId(string $userId): int;

    public function delete(Task $task): void;
}
