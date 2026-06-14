<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Mapper\RefreshToken;

use App\Core\Domain\Entity\RefreshToken\RefreshToken;
use App\Infrastructure\Persistence\Doctrine\Entity\RefreshTokenEntity;

final class RefreshTokenMapper
{
    public static function toEntity(RefreshToken $token): RefreshTokenEntity
    {
        $entity = new RefreshTokenEntity();
        $entity->setId($token->getId());
        $entity->setUserId($token->getUserId());
        $entity->setExpiresAt($token->getExpiresAt());
        $entity->setCreatedAt($token->getCreatedAt());

        return $entity;
    }

    public static function toDomain(RefreshTokenEntity $entity): RefreshToken
    {
        return RefreshToken::create(
            id: $entity->getId(),
            userId: $entity->getUserId(),
            expiresAt: $entity->getExpiresAt(),
        )->setCreatedAt($entity->getCreatedAt());
    }
}
