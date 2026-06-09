<?php

declare(strict_types=1);

namespace App\UserInterface\Presenter\User;

use App\Infrastructure\Persistence\Doctrine\Entity\UserEntity;

final class AuthenticationSuccessPresenter
{
    public function present(UserEntity $user): array
    {
        return [
            'id' => $user->getId(),
            'email' => $user->getUserIdentifier(),
        ];
    }
}
