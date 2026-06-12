<?php

declare(strict_types=1);

namespace App\UserInterface\DTO\RefreshToken;

use Symfony\Component\Validator\Constraints as Assert;

readonly class RefreshTokenRequest
{
    public function __construct(
        #[Assert\NotBlank]
        public string $refresh_token,
    ) {}
}
