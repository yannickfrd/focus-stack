<?php

declare(strict_types=1);

namespace App\Core\Application\UseCase\RefreshToken;

use App\Core\Domain\Entity\RefreshToken\RefreshToken;
use App\Core\Domain\Repository\RefreshToken\RefreshTokenRepositoryInterface;
use App\Core\Domain\Service\UuidGeneratorInterface;

final readonly class CreateRefreshTokenUseCase
{
    private const int TTL_DAYS = 30;

    public function __construct(
        private RefreshTokenRepositoryInterface $refreshTokenRepository,
        private UuidGeneratorInterface $uuidGenerator,
    ) {}

    /**
     * @throws \DateMalformedStringException
     */
    public function execute(string $userId): RefreshToken
    {
        $this->refreshTokenRepository->deleteByUserId($userId);

        $refreshToken = RefreshToken::create(
            id: $this->uuidGenerator->generate(),
            userId: $userId,
            expiresAt: new \DateTimeImmutable('+' . self::TTL_DAYS . ' days'),
        );

        $this->refreshTokenRepository->save($refreshToken);

        return $refreshToken;
    }
}
