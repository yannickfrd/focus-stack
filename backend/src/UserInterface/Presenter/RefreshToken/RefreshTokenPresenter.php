<?php

declare(strict_types=1);

namespace App\UserInterface\Presenter\RefreshToken;

use App\Core\Application\Response\RefreshTokenResponse;

final class RefreshTokenPresenter
{
    public function present(RefreshTokenResponse $response): array
    {
        return [
            'token' => $response->accessToken,
        ];
    }
}
