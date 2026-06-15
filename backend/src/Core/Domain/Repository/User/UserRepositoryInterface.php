<?php

declare(strict_types=1);

namespace App\Core\Domain\Repository\User;

use App\Core\Domain\Entity\User\User;

interface UserRepositoryInterface
{
    public function save(User $user): void;

    public function findByEmail(string $email): ?User;

    public function findById(string $id): ?User;
}
