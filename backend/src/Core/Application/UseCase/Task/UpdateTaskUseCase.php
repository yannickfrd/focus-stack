<?php

declare(strict_types=1);

namespace App\Core\Application\UseCase\Task;

use App\Core\Application\Request\Task\UpdateTaskRequest;
use App\Core\Domain\Entity\Task\Task;
use App\Core\Domain\Exception\NotFoundException;
use App\Core\Domain\Repository\Task\TaskRepositoryInterface;

final readonly class UpdateTaskUseCase
{
    public function __construct(
        private TaskRepositoryInterface $taskRepository,
    ) {}

    public function execute(string $taskId, string $userId, UpdateTaskRequest $request): Task
    {
        $task = $this->taskRepository->findByIdAndUserId($taskId, $userId);

        if ($task === null) {
            throw new NotFoundException('Task not found.');
        }

        $task
            ->setTitle($request->title)
            ->setDescription($request->description)
            ->setPriority($request->priority)
            ->setEstimatedTime($request->estimatedTime)
            ->setDone($request->done)
            ->setScheduledFor($request->scheduledFor);

        $this->taskRepository->save($task);

        return $task;
    }
}
