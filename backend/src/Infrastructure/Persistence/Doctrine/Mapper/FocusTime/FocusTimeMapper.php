<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Mapper\FocusTime;

use App\Core\Domain\Entity\FocusTime\FocusTime;
use App\Infrastructure\Persistence\Doctrine\Entity\FocusTimeEntity;

final class FocusTimeMapper
{
    public static function toEntity(FocusTime $focusTime): FocusTimeEntity
    {
        $entity = new FocusTimeEntity();
        $entity->setTaskId($focusTime->getTaskId());
        $entity->setDuration($focusTime->getDuration());
        $entity->setCompletedAt($focusTime->getCompletedAt());
        $entity->setUserId($focusTime->getUserId());

        return $entity;
    }

    public static function toDomain(FocusTimeEntity $entity): FocusTime
    {
        return FocusTime::create(
            userId: $entity->getUserId(),
            duration: $entity->getDuration(),
            taskId: $entity->getTaskId(),
        )
        ->setId($entity->getId())
        ->setCompletedAt($entity->getCompletedAt());
    }
}
