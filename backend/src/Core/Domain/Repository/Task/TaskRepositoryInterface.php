<?php

declare(strict_types=1);

namespace App\Core\Domain\Repository\Task;

use App\Core\Domain\Entity\Task\Task;
use App\Core\Domain\Entity\Task\TaskList;

interface TaskRepositoryInterface
{
    public function save(Task $task): void;

    public function saveAll(TaskList $taskList): void;

    public function findByIdAndUserId(string $id, string $userId): ?Task;

    public function findAllByUserId(string $userId): TaskList;

    public function countByUserId(string $userId): int;

    public function delete(Task $task): void;
}
