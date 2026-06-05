<?php

declare(strict_types=1);

namespace App\Tests\Unit\Infrastructure\Persistence\Doctrine\Adapter\User;

use App\Core\Domain\Entity\User\User;
use App\Infrastructure\Persistence\Doctrine\Adapter\User\UserRepositoryAdapter;
use App\Infrastructure\Persistence\Doctrine\Entity\UserEntity;
use App\Infrastructure\Persistence\Doctrine\Repository\UserEntityRepositoryInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Cache\Adapter\ArrayAdapter;

final class UserRepositoryAdapterTest extends TestCase
{
    private UserEntityRepositoryInterface $repository;
    private UserRepositoryAdapter $adapter;
    private ArrayAdapter $cache;

    protected function setUp(): void
    {
        $this->repository = $this->createStub(UserEntityRepositoryInterface::class);
        $this->cache = new ArrayAdapter();
        $this->adapter = new UserRepositoryAdapter($this->repository, $this->cache);
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
        $entity = new UserEntity();
        $entity->setId('uuid-1');
        $entity->setEmail('found@example.com');
        $entity->setPasswordHash('hashed');
        $entity->setCreatedAt(new \DateTimeImmutable());
        $this->repository->method('findByEmail')->willReturn($entity);

        $user = $this->adapter->findByEmail('found@example.com');

        $this->assertInstanceOf(User::class, $user);
        $this->assertSame('uuid-1', $user->getId());
        $this->assertSame('found@example.com', $user->getEmail());
    }

    public function testFindByIdReturnsMappedDomainUser(): void
    {
        $entity = new UserEntity();
        $entity->setId('uuid-2');
        $entity->setEmail('found@example.com');
        $entity->setPasswordHash('hashed');
        $entity->setCreatedAt(new \DateTimeImmutable());
        $this->repository->method('findById')->willReturn($entity);

        $user = $this->adapter->findById('uuid-2');

        $this->assertInstanceOf(User::class, $user);
        $this->assertSame('uuid-2', $user->getId());
    }

    public function testFindByEmailHitsRepositoryOnlyOnce(): void
    {
        $entity = new UserEntity();
        $entity->setId('uuid-1');
        $entity->setEmail('cached@example.com');
        $entity->setPasswordHash('hashed');
        $entity->setCreatedAt(new \DateTimeImmutable());

        $repository = $this->createMock(UserEntityRepositoryInterface::class);
        $repository->expects($this->once())->method('findByEmail')->willReturn($entity);

        $adapter = new UserRepositoryAdapter($repository, $this->cache);
        $adapter->findByEmail('cached@example.com');
        $adapter->findByEmail('cached@example.com');
    }

    public function testFindByIdHitsRepositoryOnlyOnce(): void
    {
        $entity = new UserEntity();
        $entity->setId('uuid-1');
        $entity->setEmail('cached@example.com');
        $entity->setPasswordHash('hashed');
        $entity->setCreatedAt(new \DateTimeImmutable());

        $repository = $this->createMock(UserEntityRepositoryInterface::class);
        $repository->expects($this->once())->method('findById')->willReturn($entity);

        $adapter = new UserRepositoryAdapter($repository, $this->cache);
        $adapter->findById('uuid-1');
        $adapter->findById('uuid-1');
    }

    public function testSaveDelegatesToRepository(): void
    {
        $repository = $this->createMock(UserEntityRepositoryInterface::class);
        $repository->expects($this->once())->method('save')->with($this->isInstanceOf(UserEntity::class));

        $user = User::create('uuid-3', 'save@example.com', 'hashed');
        (new UserRepositoryAdapter($repository, $this->cache))->save($user);
    }
}
