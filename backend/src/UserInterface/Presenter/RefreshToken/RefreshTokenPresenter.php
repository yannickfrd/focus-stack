<?php

declare(strict_types=1);

namespace App\UserInterface\Presenter\RefreshToken;

use App\Core\Domain\Entity\RefreshToken\RefreshToken;

final class RefreshTokenPresenter
{
    public function present(string $accessToken, RefreshToken $refreshToken): array
    {
        return [
            'token' => $accessToken,
            'refresh_token' => $refreshToken->getToken(),
        ];
    }
}
