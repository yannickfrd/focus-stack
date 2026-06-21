<?php

declare(strict_types=1);

namespace App\Core\Domain\Entity\Task;

use App\Core\Domain\Exception\NotFoundException;

final readonly class TaskList
{
    /** @param Task[] $tasks */
    public function __construct(private array $tasks) {}

    /** @return Task[] */
    public function tasks(): array
    {
        return $this->tasks;
    }

    /** @param string[] $ids */
    public function reorder(array $ids): void
    {
        $map = [];
        foreach ($this->tasks as $task) {
            $map[$task->getId()] = $task;
        }

        foreach ($ids as $position => $id) {
            if (!isset($map[$id])) {
                throw new NotFoundException("Task {$id} not found.");
            }
            $map[$id]->setPosition($position);
        }
    }
}
