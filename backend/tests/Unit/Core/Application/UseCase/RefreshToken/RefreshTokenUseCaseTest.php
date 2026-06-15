<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Application\UseCase\RefreshToken;

use App\Core\Application\Response\RefreshTokenResponse;
use App\Core\Application\UseCase\RefreshToken\CreateRefreshTokenUseCase;
use App\Core\Application\UseCase\RefreshToken\RefreshTokenUseCase;
use App\Core\Domain\Entity\RefreshToken\RefreshToken;
use App\Core\Domain\Entity\User\User;
use App\Core\Domain\Exception\UnauthorizedException;
use App\Core\Domain\Repository\RefreshToken\RefreshTokenRepositoryInterface;
use App\Core\Domain\Repository\User\UserRepositoryInterface;
use App\Core\Domain\Service\AccessTokenGeneratorInterface;
use PHPUnit\Framework\TestCase;

final class RefreshTokenUseCaseTest extends TestCase
{
    private RefreshTokenRepositoryInterface $refreshTokenRepository;
    private UserRepositoryInterface $userRepository;
    private AccessTokenGeneratorInterface $accessTokenGenerator;
    private CreateRefreshTokenUseCase $createRefreshTokenUseCase;
    private RefreshTokenUseCase $useCase;

    protected function setUp(): void
    {
        $this->refreshTokenRepository = $this->createMock(RefreshTokenRepositoryInterface::class);
        $this->userRepository = $this->createStub(UserRepositoryInterface::class);
        $this->accessTokenGenerator = $this->createStub(AccessTokenGeneratorInterface::class);
        $this->createRefreshTokenUseCase = $this->createStub(CreateRefreshTokenUseCase::class);

        $this->useCase = new RefreshTokenUseCase(
            $this->refreshTokenRepository,
            $this->userRepository,
            $this->accessTokenGenerator,
            $this->createRefreshTokenUseCase,
        );
    }

    public function testExecuteReturnsNewTokensAndRotates(): void
    {
        $existing = RefreshToken::create('old-id', 'user-id', new \DateTimeImmutable('+30 days'));
        $newRefreshToken = RefreshToken::create('new-uuid', 'user-id', new \DateTimeImmutable('+30 days'));
        $user = User::create('user-id', 'user@example.com', 'hash');

        $this->refreshTokenRepository->method('findByToken')->willReturn($existing);
        $this->userRepository->method('findById')->willReturn($user);
        $this->accessTokenGenerator->method('generate')->willReturn('new-jwt');
        $this->createRefreshTokenUseCase->method('execute')->willReturn($newRefreshToken);

        $this->refreshTokenRepository->expects($this->once())->method('deleteByToken')->with('old-id');

        $result = $this->useCase->execute('old-id');

        $this->assertInstanceOf(RefreshTokenResponse::class, $result);
        $this->assertSame('new-jwt', $result->accessToken);
        $this->assertSame('new-uuid', $result->refreshToken->getToken());
    }

    public function testExecuteThrowsWhenTokenNotFound(): void
    {
        $this->refreshTokenRepository->method('findByToken')->willReturn(null);

        $this->expectException(UnauthorizedException::class);
        $this->expectExceptionMessage('Refresh token not found.');

        $this->useCase->execute('invalid-token');
    }

    public function testExecuteThrowsWhenTokenExpired(): void
    {
        $expired = RefreshToken::create('id', 'user-id', new \DateTimeImmutable('-1 second'));
        $this->refreshTokenRepository->method('findByToken')->willReturn($expired);

        $this->expectException(UnauthorizedException::class);
        $this->expectExceptionMessage('Refresh token has expired.');

        $this->useCase->execute('id');
    }

    public function testExecuteThrowsWhenUserNotFound(): void
    {
        $token = RefreshToken::create('id', 'user-id', new \DateTimeImmutable('+30 days'));
        $this->refreshTokenRepository->method('findByToken')->willReturn($token);
        $this->userRepository->method('findById')->willReturn(null);

        $this->expectException(UnauthorizedException::class);
        $this->expectExceptionMessage('User not found.');

        $this->useCase->execute('id');
    }
}
