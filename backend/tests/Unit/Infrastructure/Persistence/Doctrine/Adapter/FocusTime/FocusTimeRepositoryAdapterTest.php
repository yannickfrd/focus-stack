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

    private const string UUID1 = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    private const string UUID2 = 'b1ffcd00-0d1c-5fg9-cc7e-7cc0ce491b22';
    private const string TASK_UUID = 'c2ggde11-1e2d-6gh0-dd8f-8dd1df502c33';

    public function testFindAllByUserIdReturnsMappedFocusTimes(): void
    {
        $entity1 = $this->makeEntity(self::UUID1, 'user-1', 25, self::TASK_UUID);
        $entity2 = $this->makeEntity(self::UUID2, 'user-1', 50, null);
        $this->repository->method('findBy')->willReturn([$entity1, $entity2]);

        $focusTimes = $this->adapter->findAllByUserId('user-1');

        $this->assertCount(2, $focusTimes);
        $this->assertSame(25, $focusTimes[0]->getDuration());
        $this->assertSame(50, $focusTimes[1]->getDuration());
    }

    public function testFindAllByUserIdHitsRepositoryOnlyOnce(): void
    {
        $repository = $this->createFinalMock(DoctrineFocusTimeRepository::class);
        $repository->expects($this->once())->method('findBy')->willReturn([$this->makeEntity(self::UUID1, 'user-1', 25, null)]);

        $adapter = new FocusTimeRepositoryAdapter($repository, $this->cache);
        $adapter->findAllByUserId('user-1');
        $adapter->findAllByUserId('user-1');
    }

    public function testSaveNewFocusTimePersistsEntity(): void
    {
        $repository = $this->createFinalMock(DoctrineFocusTimeRepository::class);
        $repository->expects($this->once())->method('save')
            ->with($this->isInstanceOf(FocusTimeEntity::class));

        $focusTime = FocusTime::create(self::UUID1, 'user-1', 25, null);
        (new FocusTimeRepositoryAdapter($repository, $this->cache))->save($focusTime);

        $this->assertSame(self::UUID1, $focusTime->getId());
    }

    public function testSaveInvalidatesUserCache(): void
    {
        $entity = $this->makeEntity(self::UUID1, 'user-1', 25, null);

        $repository = $this->createFinalMock(DoctrineFocusTimeRepository::class);
        $repository->method('findBy')->willReturn([$entity]);
        $repository->method('save');

        $adapter = new FocusTimeRepositoryAdapter($repository, $this->cache);
        $adapter->findAllByUserId('user-1');

        $focusTime = FocusTime::create(self::UUID2, 'user-1', 30, null);
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

    private function makeEntity(string $id, string $userId, int $duration, ?string $taskId): FocusTimeEntity
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
