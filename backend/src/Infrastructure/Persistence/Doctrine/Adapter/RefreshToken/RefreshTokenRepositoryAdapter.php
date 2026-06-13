<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Adapter\RefreshToken;

use App\Core\Domain\Entity\RefreshToken\RefreshToken;
use App\Core\Domain\Repository\RefreshToken\RefreshTokenRepositoryInterface;
use App\Infrastructure\Persistence\Doctrine\Mapper\RefreshToken\RefreshTokenMapper;
use App\Infrastructure\Persistence\Doctrine\Repository\DoctrineRefreshTokenRepository;
use Symfony\Component\DependencyInjection\Attribute\AsAlias;

#[AsAlias(RefreshTokenRepositoryInterface::class)]
final readonly class RefreshTokenRepositoryAdapter implements RefreshTokenRepositoryInterface
{
    public function __construct(
        private DoctrineRefreshTokenRepository $repository,
    ) {}

    public function save(RefreshToken $token): void
    {
        $this->repository->save(RefreshTokenMapper::toEntity($token));
    }

    public function findByToken(string $token): ?RefreshToken
    {
        $entity = $this->repository->findByToken($token);

        return $entity !== null ? RefreshTokenMapper::toDomain($entity) : null;
    }

    public function deleteByToken(string $token): void
    {
        $this->repository->deleteByToken($token);
    }
}
