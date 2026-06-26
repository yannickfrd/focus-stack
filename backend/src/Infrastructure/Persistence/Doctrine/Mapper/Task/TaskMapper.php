<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Mapper\Task;

use App\Core\Domain\Entity\Task\Task;
use App\Infrastructure\Persistence\Doctrine\Entity\TaskEntity;

final class TaskMapper
{
    public static function toEntity(Task $task): TaskEntity
    {
        $entity = new TaskEntity();
        $entity->setId($task->getId());
        self::updateEntity($task, $entity);

        return $entity;
    }

    public static function updateEntity(Task $task, TaskEntity $entity): void
    {
        $entity->setTitle($task->getTitle());
        $entity->setDescription($task->getDescription());
        $entity->setPriority($task->getPriority());
        $entity->setDone($task->isDone());
        $entity->setScheduledFor($task->getScheduledFor());
        $entity->setEstimatedTime($task->getEstimatedTime());
        $entity->setPosition($task->getPosition());
        $entity->setCreatedAt($task->getCreatedAt());
        $entity->setUserId($task->getUserId());
    }

    public static function toDomain(TaskEntity $entity): Task
    {
        return Task::create(
            id: $entity->getId(),
            title: $entity->getTitle(),
            userId: $entity->getUserId(),
            description: $entity->getDescription(),
            priority: $entity->getPriority(),
            scheduledFor: $entity->getScheduledFor(),
            estimatedTime: $entity->getEstimatedTime(),
            position: $entity->getPosition(),
        )
        ->setDone($entity->isDone())
        ->setCreatedAt($entity->getCreatedAt());
    }
}
