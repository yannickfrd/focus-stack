<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Mapper\User;

use App\Core\Domain\Repository\User\User;
use App\Infrastructure\Persistence\Doctrine\Entity\UserEntity;

final class UserMapper
{
    public static function toEntity(User $user): UserEntity
    {
        return new UserEntity(
            $user->getId(),
            $user->getEmail(),
            $user->getPasswordHash(),
            $user->getCreatedAt(),
        );
    }

    public static function toDomain(UserEntity $entity): User
    {
        return User::create(
            id: $entity->getId(),
            email: $entity->getEmail(),
            passwordHash: $entity->getPasswordHash(),
        )->setCreatedAt($entity->getCreatedAt());
    }
}
