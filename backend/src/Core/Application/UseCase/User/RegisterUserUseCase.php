<?php

declare(strict_types=1);

namespace App\Core\Application\UseCase\User;

use App\Core\Domain\Repository\User\User;
use App\Core\Domain\Repository\User\UserRepositoryInterface;

final readonly class RegisterUserUseCase
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
    ) {}

    public function execute(string $email, string $password): User
    {
        if ($this->userRepository->findByEmail($email) !== null) {
            throw new \DomainException('This email is already registered.');
        }

        $user = User::create(
            id: $this->generateUuid(),
            email: $email,
            passwordHash: password_hash($password, PASSWORD_BCRYPT),
        );

        $this->userRepository->save($user);

        return $user;
    }

    private function generateUuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
