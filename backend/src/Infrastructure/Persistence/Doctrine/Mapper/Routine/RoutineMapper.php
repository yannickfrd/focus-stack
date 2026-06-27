<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Mapper\Routine;

use App\Core\Domain\Entity\Routine\Routine;
use App\Infrastructure\Persistence\Doctrine\Entity\RoutineEntity;

final class RoutineMapper
{
    public static function toEntity(Routine $routine): RoutineEntity
    {
        $entity = new RoutineEntity();
        $entity->setId($routine->getId());
        $entity->setTitle($routine->getTitle());
        $entity->setColor($routine->getColor());
        $entity->setUserId($routine->getUserId());
        $entity->setCreatedAt($routine->getCreatedAt());

        return $entity;
    }

    public static function updateEntity(Routine $routine, RoutineEntity $entity): void
    {
        $entity->setTitle($routine->getTitle());
        $entity->setColor($routine->getColor());
    }

    public static function toDomain(RoutineEntity $entity): Routine
    {
        return Routine::create(
            id: $entity->getId(),
            title: $entity->getTitle(),
            userId: $entity->getUserId(),
            color: $entity->getColor(),
        )
        ->setCreatedAt($entity->getCreatedAt());
    }
}
