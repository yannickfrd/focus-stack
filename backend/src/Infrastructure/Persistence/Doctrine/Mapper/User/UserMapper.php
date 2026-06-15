<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Mapper\User;

use App\Core\Domain\Entity\User\User;
use App\Infrastructure\Persistence\Doctrine\Entity\UserEntity;

final class UserMapper
{
    public static function toEntity(User $user): UserEntity
    {
        $entity = new UserEntity();
        $entity->setId($user->getId());
        $entity->setEmail($user->getEmail());
        $entity->setPasswordHash($user->getPasswordHash());
        $entity->setCreatedAt($user->getCreatedAt());

        return $entity;
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
