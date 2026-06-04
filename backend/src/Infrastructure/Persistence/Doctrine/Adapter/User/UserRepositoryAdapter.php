<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Adapter\User;

use App\Core\Domain\Repository\User\User;
use App\Core\Domain\Repository\User\UserRepositoryInterface;
use App\Infrastructure\Persistence\Doctrine\Mapper\User\UserMapper;
use App\Infrastructure\Persistence\Doctrine\Repository\UserEntityRepositoryInterface;

final readonly class UserRepositoryAdapter implements UserRepositoryInterface
{
    public function __construct(
        private UserEntityRepositoryInterface $repository,
    ) {}

    public function save(User $user): void
    {
        $this->repository->save(UserMapper::toEntity($user));
    }

    public function findByEmail(string $email): ?User
    {
        $entity = $this->repository->findByEmail($email);

        return $entity !== null ? UserMapper::toDomain($entity) : null;
    }

    public function findById(string $id): ?User
    {
        $entity = $this->repository->findById($id);

        return $entity !== null ? UserMapper::toDomain($entity) : null;
    }
}
