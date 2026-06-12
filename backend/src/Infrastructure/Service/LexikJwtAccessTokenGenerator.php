<?php

declare(strict_types=1);

namespace App\Infrastructure\Service;

use App\Core\Domain\Service\AccessTokenGeneratorInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

final readonly class LexikJwtAccessTokenGenerator implements AccessTokenGeneratorInterface
{
    public function __construct(
        private JWTTokenManagerInterface $jwtManager,
    ) {}

    public function generate(string $userIdentifier): string
    {
        $user = new class($userIdentifier) implements UserInterface {
            public function __construct(private readonly string $identifier) {}

            public function getUserIdentifier(): string
            {
                return $this->identifier;
            }

            public function getRoles(): array
            {
                return ['ROLE_USER'];
            }

            public function eraseCredentials(): void {}
        };

        return $this->jwtManager->create($user);
    }
}
