<?php

declare(strict_types=1);

namespace App\Core\Application\Response;

use App\Core\Domain\Entity\RefreshToken\RefreshToken;

final readonly class RefreshTokenResponse
{
    public function __construct(
        public string $accessToken,
        public RefreshToken $refreshToken,
    ) {}
}
