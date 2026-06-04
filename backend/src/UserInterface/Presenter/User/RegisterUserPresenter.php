<?php

declare(strict_types=1);

namespace App\UserInterface\Presenter\User;

use App\Core\Domain\Repository\User\User;

final class RegisterUserPresenter
{
    public function present(User $user): array
    {
        return [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'createdAt' => $user->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }
}
