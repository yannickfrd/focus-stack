<?php

declare(strict_types=1);

namespace App\Core\Application\UseCase\User;

final readonly class LogoutUserUseCase
{
    public function execute(): void
    {
        // JWT stateless: rien à invalider côté serveur
    }
}
