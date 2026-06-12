<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Application\UseCase\RefreshToken;

use App\Core\Application\UseCase\RefreshToken\CreateRefreshTokenUseCase;
use App\Core\Domain\Entity\RefreshToken\RefreshToken;
use App\Core\Domain\Repository\RefreshToken\RefreshTokenRepositoryInterface;
use App\Core\Domain\Service\UuidGeneratorInterface;
use PHPUnit\Framework\TestCase;

final class CreateRefreshTokenUseCaseTest extends TestCase
{
    public function testExecuteCreatesAndSavesRefreshToken(): void
    {
        $repository = $this->createMock(RefreshTokenRepositoryInterface::class);
        $repository->expects($this->once())->method('save')->with($this->isInstanceOf(RefreshToken::class));

        $uuidGenerator = $this->createStub(UuidGeneratorInterface::class);
        $uuidGenerator->method('generate')->willReturn('fixed-uuid');

        $result = (new CreateRefreshTokenUseCase($repository, $uuidGenerator))->execute('user-id');

        $this->assertSame('fixed-uuid', $result->getToken());
        $this->assertSame('user-id', $result->getUserId());
        $this->assertFalse($result->isExpired());
    }
}
