<?php

declare(strict_types=1);

namespace App\Core\Application\UseCase\User;

use App\Core\Domain\Entity\User\User;
use App\Core\Domain\Repository\User\UserRepositoryInterface;
use App\Core\Domain\Service\UuidGeneratorInterface;

final readonly class RegisterUserUseCase
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private UuidGeneratorInterface $uuidGenerator,
    ) {}

    public function execute(string $email, string $password): User
    {
        if ($this->userRepository->findByEmail($email) !== null) {
            throw new \DomainException('This email is already registered.');
        }

        $user = User::create(
            id: $this->uuidGenerator->generate(),
            email: $email,
            passwordHash: password_hash($password, PASSWORD_BCRYPT),
        );

        $this->userRepository->save($user);

        return $user;
    }
}
