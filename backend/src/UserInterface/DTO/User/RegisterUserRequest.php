<?php

declare(strict_types=1);

namespace App\UserInterface\DTO\User;

use Symfony\Component\Validator\Constraints as Assert;

readonly class RegisterUserRequest
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Email]
        public string $email,

        #[Assert\NotBlank]
        #[Assert\Length(min: 8)]
        public string $password,
    ) {}
}
