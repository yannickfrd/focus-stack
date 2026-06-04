<?php

declare(strict_types=1);

namespace App\Tests\Unit\Infrastructure\Persistence\Doctrine\Adapter\User;

use App\Core\Domain\Repository\User\User;
use App\Infrastructure\Persistence\Doctrine\Adapter\User\UserRepositoryAdapter;
use App\Infrastructure\Persistence\Doctrine\Entity\UserEntity;
use App\Infrastructure\Persistence\Doctrine\Repository\UserEntityRepositoryInterface;
use PHPUnit\Framework\TestCase;

final class UserRepositoryAdapterTest extends TestCase
{
    private UserEntityRepositoryInterface $repository;
    private UserRepositoryAdapter $adapter;

    protected function setUp(): void
    {
        $this->repository = $this->createStub(UserEntityRepositoryInterface::class);
        $this->adapter = new UserRepositoryAdapter($this->repository);
    }

    public function testFindByEmailReturnsNullWhenNotFound(): void
    {
        $this->repository->method('findByEmail')->willReturn(null);

        $this->assertNull($this->adapter->findByEmail('unknown@example.com'));
    }

    public function testFindByIdReturnsNullWhenNotFound(): void
    {
        $this->repository->method('findById')->willReturn(null);

        $this->assertNull($this->adapter->findById('unknown-uuid'));
    }

    public function testFindByEmailReturnsMappedDomainUser(): void
    {
        $entity = new UserEntity('uuid-1', 'found@example.com', 'hashed', new \DateTimeImmutable());
        $this->repository->method('findByEmail')->willReturn($entity);

        $user = $this->adapter->findByEmail('found@example.com');

        $this->assertInstanceOf(User::class, $user);
        $this->assertSame('uuid-1', $user->getId());
        $this->assertSame('found@example.com', $user->getEmail());
    }

    public function testFindByIdReturnsMappedDomainUser(): void
    {
        $entity = new UserEntity('uuid-2', 'found@example.com', 'hashed', new \DateTimeImmutable());
        $this->repository->method('findById')->willReturn($entity);

        $user = $this->adapter->findById('uuid-2');

        $this->assertInstanceOf(User::class, $user);
        $this->assertSame('uuid-2', $user->getId());
    }

    public function testSaveDelegatesToRepository(): void
    {
        $repository = $this->createMock(UserEntityRepositoryInterface::class);
        $repository->expects($this->once())->method('save')->with($this->isInstanceOf(UserEntity::class));

        $user = User::create('uuid-3', 'save@example.com', 'hashed');
        (new UserRepositoryAdapter($repository))->save($user);
    }
}
