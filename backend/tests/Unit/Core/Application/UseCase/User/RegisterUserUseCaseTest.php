<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Application\UseCase\User;

use App\Core\Application\UseCase\User\RegisterUserUseCase;
use App\Core\Domain\Entity\User\User;
use App\Core\Domain\Repository\User\UserRepositoryInterface;
use App\Core\Domain\Service\UuidGeneratorInterface;
use PHPUnit\Framework\TestCase;

final class RegisterUserUseCaseTest extends TestCase
{
    public function testExecuteCreatesAndSavesUser(): void
    {
        $repository = $this->createMock(UserRepositoryInterface::class);
        $repository->method('findByEmail')->willReturn(null);
        $repository->expects($this->once())->method('save')->with($this->isInstanceOf(User::class));

        $uuidGenerator = $this->createStub(UuidGeneratorInterface::class);
        $uuidGenerator->method('generate')->willReturn('fixed-uuid');

        $useCase = new RegisterUserUseCase($repository, $uuidGenerator);
        $user = $useCase->execute('new@example.com', 'secret');

        $this->assertSame('new@example.com', $user->getEmail());
        $this->assertTrue(password_verify('secret', $user->getPasswordHash()));
        $this->assertSame('fixed-uuid', $user->getId());
    }

    public function testExecuteThrowsWhenEmailAlreadyRegistered(): void
    {
        $existing = User::create('id', 'taken@example.com', 'hash');
        $repository = $this->createStub(UserRepositoryInterface::class);
        $repository->method('findByEmail')->willReturn($existing);

        $uuidGenerator = $this->createStub(UuidGeneratorInterface::class);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('This email is already registered.');

        $useCase = new RegisterUserUseCase($repository, $uuidGenerator);
        $useCase->execute('taken@example.com', 'secret');
    }
}
