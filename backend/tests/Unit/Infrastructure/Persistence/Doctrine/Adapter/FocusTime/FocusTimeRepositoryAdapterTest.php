<?php

declare(strict_types=1);

namespace App\Tests\Unit\Infrastructure\Persistence\Doctrine\Adapter\FocusTime;

use App\Core\Domain\Entity\FocusTime\FocusTime;
use App\Infrastructure\Persistence\Doctrine\Adapter\FocusTime\FocusTimeRepositoryAdapter;
use App\Infrastructure\Persistence\Doctrine\Entity\FocusTimeEntity;
use App\Infrastructure\Persistence\Doctrine\Repository\DoctrineFocusTimeRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Cache\Adapter\ArrayAdapter;

final class FocusTimeRepositoryAdapterTest extends TestCase
{
    private DoctrineFocusTimeRepository $repository;
    private FocusTimeRepositoryAdapter $adapter;
    private ArrayAdapter $cache;

    protected function setUp(): void
    {
        $this->repository = $this->createFinalStub(DoctrineFocusTimeRepository::class);
        $this->cache = new ArrayAdapter();
        $this->adapter = new FocusTimeRepositoryAdapter($this->repository, $this->cache);
    }

    public function testFindAllByUserIdReturnsEmptyArray(): void
    {
        $this->repository->method('findBy')->willReturn([]);

        $this->assertSame([], $this->adapter->findAllByUserId('user-1'));
    }

    public function testFindAllByUserIdReturnsMappedFocusTimes(): void
    {
        $entity1 = $this->makeEntity(1, 'user-1', 25, 10);
        $entity2 = $this->makeEntity(2, 'user-1', 50, null);
        $this->repository->method('findBy')->willReturn([$entity1, $entity2]);

        $focusTimes = $this->adapter->findAllByUserId('user-1');

        $this->assertCount(2, $focusTimes);
        $this->assertSame(25, $focusTimes[0]->getDuration());
        $this->assertSame(50, $focusTimes[1]->getDuration());
    }

    public function testFindAllByUserIdHitsRepositoryOnlyOnce(): void
    {
        $repository = $this->createFinalMock(DoctrineFocusTimeRepository::class);
        $repository->expects($this->once())->method('findBy')->willReturn([$this->makeEntity(1, 'user-1', 25, null)]);

        $adapter = new FocusTimeRepositoryAdapter($repository, $this->cache);
        $adapter->findAllByUserId('user-1');
        $adapter->findAllByUserId('user-1');
    }

    public function testSaveCreatesEntityAndSetsIdOnDomainFocusTime(): void
    {
        $repository = $this->createFinalMock(DoctrineFocusTimeRepository::class);
        $repository->expects($this->once())->method('save')
            ->with($this->isInstanceOf(FocusTimeEntity::class))
            ->willReturnCallback(function (FocusTimeEntity $entity): void {
                $entity->setId(42);
            });

        $focusTime = FocusTime::create('user-1', 25, null);
        (new FocusTimeRepositoryAdapter($repository, $this->cache))->save($focusTime);

        $this->assertSame(42, $focusTime->getId());
    }

    public function testSaveInvalidatesUserCache(): void
    {
        $entity = $this->makeEntity(1, 'user-1', 25, null);

        $repository = $this->createFinalMock(DoctrineFocusTimeRepository::class);
        $repository->method('findBy')->willReturn([$entity]);
        $repository->method('save')->willReturnCallback(function (FocusTimeEntity $e): void {
            $e->setId(1);
        });

        $adapter = new FocusTimeRepositoryAdapter($repository, $this->cache);
        $adapter->findAllByUserId('user-1');

        $focusTime = FocusTime::create('user-1', 30, null);
        $adapter->save($focusTime);

        $repository->expects($this->once())->method('findBy')->willReturn([$entity]);
        $adapter->findAllByUserId('user-1');
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

    private function makeEntity(int $id, string $userId, int $duration, ?int $taskId): FocusTimeEntity
    {
        $entity = new FocusTimeEntity();
        $entity->setId($id);
        $entity->setUserId($userId);
        $entity->setDuration($duration);
        $entity->setTaskId($taskId);
        $entity->setCompletedAt(new \DateTimeImmutable());

        return $entity;
    }
}
