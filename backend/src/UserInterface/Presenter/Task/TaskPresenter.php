<?php

declare(strict_types=1);

namespace App\UserInterface\Presenter\Task;

use App\Core\Domain\Entity\Task\Task;
use App\Core\Domain\Entity\Task\TaskList;

final class TaskPresenter
{
    public function present(Task $task): array
    {
        return [
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'description' => $task->getDescription(),
            'priority' => $task->getPriority()->value,
            'done' => $task->isDone(),
            'scheduledFor' => $task->getScheduledFor()?->value,
            'estimatedTime' => $task->getEstimatedTime(),
            'createdAt' => $task->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }

    public function presentAll(TaskList $taskList): array
    {
        return array_map($this->present(...), $taskList->tasks());
    }
}
