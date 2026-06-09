<?php

declare(strict_types=1);

namespace App\Tests\Unit\Infrastructure\Persistence\Doctrine\Adapter\User;

use App\Core\Domain\Entity\User\User;
use App\Infrastructure\Persistence\Doctrine\Adapter\User\UserRepositoryAdapter;
use App\Infrastructure\Persistence\Doctrine\Entity\UserEntity;
use App\Infrastructure\Persistence\Doctrine\Repository\DoctrineUserRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Cache\Adapter\ArrayAdapter;

final class UserRepositoryAdapterTest extends TestCase
{
    private DoctrineUserRepository $repository;
    private UserRepositoryAdapter $adapter;
    private ArrayAdapter $cache;

    protected function setUp(): void
    {
        $this->repository = $this->createFinalStub(DoctrineUserRepository::class);
        $this->cache = new ArrayAdapter();
        $this->adapter = new UserRepositoryAdapter($this->repository, $this->cache);
    }

    public function testFindByEmailReturnsNullWhenNotFound(): void
    {
        $this->repository->method('findOneBy')->willReturn(null);

        $this->assertNull($this->adapter->findByEmail('unknown@example.com'));
    }

    public function testFindByIdReturnsNullWhenNotFound(): void
    {
        $this->repository->method('find')->willReturn(null);

        $this->assertNull($this->adapter->findById('unknown-uuid'));
    }

    public function testFindByEmailReturnsMappedDomainUser(): void
    {
        $entity = $this->makeEntity('uuid-1', 'found@example.com');
        $this->repository->method('findOneBy')->willReturn($entity);

        $user = $this->adapter->findByEmail('found@example.com');

        $this->assertInstanceOf(User::class, $user);
        $this->assertSame('uuid-1', $user->getId());
        $this->assertSame('found@example.com', $user->getEmail());
    }

    public function testFindByIdReturnsMappedDomainUser(): void
    {
        $entity = $this->makeEntity('uuid-2', 'found@example.com');
        $this->repository->method('find')->willReturn($entity);

        $user = $this->adapter->findById('uuid-2');

        $this->assertInstanceOf(User::class, $user);
        $this->assertSame('uuid-2', $user->getId());
    }

    public function testFindByEmailHitsRepositoryOnlyOnce(): void
    {
        $repository = $this->createFinalMock(DoctrineUserRepository::class);
        $repository->expects($this->once())->method('findOneBy')->willReturn($this->makeEntity('uuid-1', 'cached@example.com'));

        $adapter = new UserRepositoryAdapter($repository, $this->cache);
        $adapter->findByEmail('cached@example.com');
        $adapter->findByEmail('cached@example.com');
    }

    public function testFindByIdHitsRepositoryOnlyOnce(): void
    {
        $repository = $this->createFinalMock(DoctrineUserRepository::class);
        $repository->expects($this->once())->method('find')->willReturn($this->makeEntity('uuid-1', 'cached@example.com'));

        $adapter = new UserRepositoryAdapter($repository, $this->cache);
        $adapter->findById('uuid-1');
        $adapter->findById('uuid-1');
    }

    public function testSaveDelegatesToRepository(): void
    {
        $repository = $this->createFinalMock(DoctrineUserRepository::class);
        $repository->expects($this->once())->method('save')->with($this->isInstanceOf(UserEntity::class));

        $user = User::create('uuid-3', 'save@example.com', 'hashed');
        (new UserRepositoryAdapter($repository, $this->cache))->save($user);
    }

    /**
     * @template T of object
     * @param class-string<T> $class
     * @return T&\PHPUnit\Framework\MockObject\MockObject
     * @noinspection PhpUnitInvalidMockingEntityInspection
     */
    private function createFinalMock(string $class): \PHPUnit\Framework\MockObject\MockObject
    {
        /** @noinspection PhpUnitInvalidMockingEntityInspection */
        return $this->createMock($class);
    }

    /**
     * @template T of object
     * @param class-string<T> $class
     * @return T&\PHPUnit\Framework\MockObject\Stub
     * @noinspection PhpUnitInvalidMockingEntityInspection
     */
    private function createFinalStub(string $class): \PHPUnit\Framework\MockObject\Stub
    {
        /** @noinspection PhpUnitInvalidMockingEntityInspection */
        return $this->createStub($class);
    }

    private function makeEntity(string $id, string $email): UserEntity
    {
        $entity = new UserEntity();
        $entity->setId($id);
        $entity->setEmail($email);
        $entity->setPasswordHash('hashed');
        $entity->setCreatedAt(new \DateTimeImmutable());

        return $entity;
    }
}
