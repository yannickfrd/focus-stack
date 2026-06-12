<?php

declare(strict_types=1);

namespace App\Tests\Unit\Infrastructure\Persistence\Doctrine\Adapter\RefreshToken;

use App\Core\Domain\Entity\RefreshToken\RefreshToken;
use App\Infrastructure\Persistence\Doctrine\Adapter\RefreshToken\RefreshTokenRepositoryAdapter;
use App\Infrastructure\Persistence\Doctrine\Entity\RefreshTokenEntity;
use App\Infrastructure\Persistence\Doctrine\Repository\DoctrineRefreshTokenRepository;
use PHPUnit\Framework\TestCase;

final class RefreshTokenRepositoryAdapterTest extends TestCase
{
    private DoctrineRefreshTokenRepository $repository;
    private RefreshTokenRepositoryAdapter $adapter;

    protected function setUp(): void
    {
        $this->repository = $this->createFinalStub(DoctrineRefreshTokenRepository::class);
        $this->adapter = new RefreshTokenRepositoryAdapter($this->repository);
    }

    public function testFindByTokenReturnsNullWhenNotFound(): void
    {
        $this->repository->method('findByToken')->willReturn(null);

        $this->assertNull($this->adapter->findByToken('unknown'));
    }

    public function testFindByTokenReturnsMappedDomainRefreshToken(): void
    {
        $entity = $this->makeEntity('uuid-1', 'user-id');
        $this->repository->method('findByToken')->willReturn($entity);

        $result = $this->adapter->findByToken('uuid-1');

        $this->assertInstanceOf(RefreshToken::class, $result);
        $this->assertSame('uuid-1', $result->getId());
        $this->assertSame('user-id', $result->getUserId());
    }

    public function testSaveDelegatesToRepository(): void
    {
        $repository = $this->createFinalMock(DoctrineRefreshTokenRepository::class);
        $repository->expects($this->once())->method('save')->with($this->isInstanceOf(RefreshTokenEntity::class));

        $token = RefreshToken::create('uuid-1', 'user-id', new \DateTimeImmutable('+30 days'));
        (new RefreshTokenRepositoryAdapter($repository))->save($token);
    }

    public function testDeleteByTokenDelegatesToRepository(): void
    {
        $repository = $this->createFinalMock(DoctrineRefreshTokenRepository::class);
        $repository->expects($this->once())->method('deleteByToken')->with('uuid-1');

        (new RefreshTokenRepositoryAdapter($repository))->deleteByToken('uuid-1');
    }

    /**
     * @template T of object
     * @param class-string<T> $class
     * @return T&\PHPUnit\Framework\MockObject\MockObject
     * @noinspection PhpUnitInvalidMockingEntityInspection
     */
    private function createFinalMock(string $class): \PHPUnit\Framework\MockObject\MockObject
    {
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
        return $this->createStub($class);
    }

    private function makeEntity(string $id, string $userId): RefreshTokenEntity
    {
        $entity = new RefreshTokenEntity();
        $entity->setId($id);
        $entity->setUserId($userId);
        $entity->setExpiresAt(new \DateTimeImmutable('+30 days'));
        $entity->setCreatedAt(new \DateTimeImmutable());

        return $entity;
    }
}
