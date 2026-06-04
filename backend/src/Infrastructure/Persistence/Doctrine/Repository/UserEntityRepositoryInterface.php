<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Repository;

use App\Infrastructure\Persistence\Doctrine\Entity\UserEntity;

interface UserEntityRepositoryInterface
{
    public function save(UserEntity $entity): void;

    public function findByEmail(string $email): ?UserEntity;

    public function findById(string $id): ?UserEntity;
}
