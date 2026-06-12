<?php

declare(strict_types=1);

namespace App\Core\Application\UseCase\RefreshToken;

use App\Core\Application\Response\RefreshTokenResponse;
use App\Core\Domain\Repository\RefreshToken\RefreshTokenRepositoryInterface;
use App\Core\Domain\Repository\User\UserRepositoryInterface;
use App\Core\Domain\Service\AccessTokenGeneratorInterface;

final readonly class RefreshTokenUseCase
{
    public function __construct(
        private RefreshTokenRepositoryInterface $refreshTokenRepository,
        private UserRepositoryInterface $userRepository,
        private AccessTokenGeneratorInterface $accessTokenGenerator,
        private CreateRefreshTokenUseCase $createRefreshTokenUseCase,
    ) {}

    public function execute(string $tokenValue): RefreshTokenResponse
    {
        $existing = $this->refreshTokenRepository->findByToken($tokenValue);

        if ($existing === null) {
            throw new \DomainException('Refresh token not found.');
        }

        if ($existing->isExpired()) {
            throw new \DomainException('Refresh token has expired.');
        }

        $user = $this->userRepository->findById($existing->getUserId());

        if ($user === null) {
            throw new \DomainException('User not found.');
        }

        $newAccessToken = $this->accessTokenGenerator->generate($user->getEmail());

        $this->refreshTokenRepository->deleteByToken($tokenValue);

        $newRefreshToken = $this->createRefreshTokenUseCase->execute($user->getId());

        return new RefreshTokenResponse($newAccessToken, $newRefreshToken);
    }
}
