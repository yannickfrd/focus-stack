<?php

declare(strict_types=1);

namespace App\Core\Domain\Repository\RefreshToken;

use App\Core\Domain\Entity\RefreshToken\RefreshToken;

interface RefreshTokenRepositoryInterface
{
    public function save(RefreshToken $token): void;

    public function findByToken(string $token): ?RefreshToken;

    public function deleteByToken(string $token): void;
}
