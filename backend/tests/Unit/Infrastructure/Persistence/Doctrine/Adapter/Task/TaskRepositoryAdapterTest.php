<?php

declare(strict_types=1);

namespace App\Tests\Unit\Infrastructure\Persistence\Doctrine\Adapter\Task;

use App\Core\Domain\Entity\Task\Priority;
use App\Core\Domain\Entity\Task\ScheduledFor;
use App\Core\Domain\Entity\Task\Task;
use App\Infrastructure\Persistence\Doctrine\Adapter\Task\TaskRepositoryAdapter;
use App\Infrastructure\Persistence\Doctrine\Entity\TaskEntity;
use App\Infrastructure\Persistence\Doctrine\Repository\DoctrineTaskRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Cache\Adapter\ArrayAdapter;

final class TaskRepositoryAdapterTest extends TestCase
{
    private DoctrineTaskRepository $repository;
    private TaskRepositoryAdapter $adapter;
    private ArrayAdapter $cache;

    protected function setUp(): void
    {
        $this->repository = $this->createFinalStub(DoctrineTaskRepository::class);
        $this->cache = new ArrayAdapter();
        $this->adapter = new TaskRepositoryAdapter($this->repository, $this->cache);
    }

    public function testFindByIdAndUserIdReturnsNullWhenNotFound(): void
    {
        $this->repository->method('findOneBy')->willReturn(null);

        $this->assertNull($this->adapter->findByIdAndUserId(99, 'user-1'));
    }

    public function testFindByIdAndUserIdReturnsMappedDomainTask(): void
    {
        $entity = $this->makeEntity(1, 'My Task', 'user-1');
        $this->repository->method('findOneBy')->willReturn($entity);

        $task = $this->adapter->findByIdAndUserId(1, 'user-1');

        $this->assertInstanceOf(Task::class, $task);
        $this->assertSame(1, $task->getId());
        $this->assertSame('My Task', $task->getTitle());
        $this->assertSame('user-1', $task->getUserId());
    }

    public function testFindByIdAndUserIdHitsRepositoryOnlyOnce(): void
    {
        $repository = $this->createFinalMock(DoctrineTaskRepository::class);
        $repository->expects($this->once())->method('findOneBy')->willReturn($this->makeEntity(1, 'Task', 'user-1'));

        $adapter = new TaskRepositoryAdapter($repository, $this->cache);
        $adapter->findByIdAndUserId(1, 'user-1');
        $adapter->findByIdAndUserId(1, 'user-1');
    }

    public function testFindAllByUserIdReturnsEmptyArray(): void
    {
        $this->repository->method('findBy')->willReturn([]);

        $this->assertSame([], $this->adapter->findAllByUserId('user-1'));
    }

    public function testFindAllByUserIdReturnsMappedTasks(): void
    {
        $entity1 = $this->makeEntity(1, 'Task A', 'user-1');
        $entity2 = $this->makeEntity(2, 'Task B', 'user-1');
        $this->repository->method('findBy')->willReturn([$entity1, $entity2]);

        $tasks = $this->adapter->findAllByUserId('user-1');

        $this->assertCount(2, $tasks);
        $this->assertSame('Task A', $tasks[0]->getTitle());
        $this->assertSame('Task B', $tasks[1]->getTitle());
    }

    public function testFindAllByUserIdHitsRepositoryOnlyOnce(): void
    {
        $repository = $this->createFinalMock(DoctrineTaskRepository::class);
        $repository->expects($this->once())->method('findBy')->willReturn([$this->makeEntity(1, 'Task', 'user-1')]);

        $adapter = new TaskRepositoryAdapter($repository, $this->cache);
        $adapter->findAllByUserId('user-1');
        $adapter->findAllByUserId('user-1');
    }

    public function testCountByUserIdReturnsCount(): void
    {
        $this->repository->method('count')->willReturn(3);

        $this->assertSame(3, $this->adapter->countByUserId('user-1'));
    }

    public function testCountByUserIdHitsRepositoryOnlyOnce(): void
    {
        $repository = $this->createFinalMock(DoctrineTaskRepository::class);
        $repository->expects($this->once())->method('count')->willReturn(5);

        $adapter = new TaskRepositoryAdapter($repository, $this->cache);
        $adapter->countByUserId('user-1');
        $adapter->countByUserId('user-1');
    }

    public function testSaveCreatesEntityAndSetsIdOnDomainTask(): void
    {
        $repository = $this->createFinalMock(DoctrineTaskRepository::class);
        $repository->expects($this->once())->method('save')
            ->with($this->isInstanceOf(TaskEntity::class))
            ->willReturnCallback(function (TaskEntity $entity): void {
                $entity->setId(42);
            });

        $task = Task::create('New Task', 'user-1');
        (new TaskRepositoryAdapter($repository, $this->cache))->save($task);

        $this->assertSame(42, $task->getId());
    }

    public function testSaveUpdatesExistingEntityWhenTaskHasId(): void
    {
        $entity = $this->makeEntity(5, 'Old Title', 'user-1');

        $repository = $this->createFinalMock(DoctrineTaskRepository::class);
        $repository->method('find')->with(5)->willReturn($entity);
        $repository->expects($this->once())->method('save')->with($entity);

        $task = Task::create('New Title', 'user-1');
        $task->setId(5);

        (new TaskRepositoryAdapter($repository, $this->cache))->save($task);
    }

    public function testSaveInvalidatesTaskAndUserCaches(): void
    {
        $entity = $this->makeEntity(1, 'Task', 'user-1');

        $repository = $this->createFinalMock(DoctrineTaskRepository::class);
        $repository->method('findOneBy')->willReturn($entity);
        $repository->method('find')->willReturn($entity);
        $repository->method('save');

        $adapter = new TaskRepositoryAdapter($repository, $this->cache);

        $adapter->findByIdAndUserId(1, 'user-1');
        $adapter->findAllByUserId('user-1');

        $task = Task::create('Updated', 'user-1');
        $task->setId(1);
        $adapter->save($task);

        $repository->expects($this->once())->method('findOneBy')->willReturn($entity);
        $adapter->findByIdAndUserId(1, 'user-1');

        $repository->expects($this->once())->method('findBy')->willReturn([$entity]);
        $adapter->findAllByUserId('user-1');
    }

    public function testSaveAllDelegatesToRepository(): void
    {
        $entity = $this->makeEntity(1, 'Task', 'user-1');

        $repository = $this->createFinalMock(DoctrineTaskRepository::class);
        $repository->method('find')->with(1)->willReturn($entity);
        $repository->expects($this->once())->method('saveAll');

        $task = Task::create('Task', 'user-1');
        $task->setId(1);

        (new TaskRepositoryAdapter($repository, $this->cache))->saveAll([$task]);
    }

    public function testDeleteDelegatesToRepository(): void
    {
        $entity = $this->makeEntity(1, 'Task', 'user-1');

        $repository = $this->createFinalMock(DoctrineTaskRepository::class);
        $repository->method('find')->with(1)->willReturn($entity);
        $repository->expects($this->once())->method('delete')->with($entity);

        $task = Task::create('Task', 'user-1');
        $task->setId(1);

        (new TaskRepositoryAdapter($repository, $this->cache))->delete($task);
    }

    public function testDeleteInvalidatesCaches(): void
    {
        $entity = $this->makeEntity(1, 'Task', 'user-1');

        $repository = $this->createFinalMock(DoctrineTaskRepository::class);
        $repository->method('findOneBy')->willReturn($entity);
        $repository->method('findBy')->willReturn([$entity]);
        $repository->method('find')->willReturn($entity);
        $repository->method('delete');

        $adapter = new TaskRepositoryAdapter($repository, $this->cache);

        $adapter->findByIdAndUserId(1, 'user-1');
        $adapter->findAllByUserId('user-1');

        $task = Task::create('Task', 'user-1');
        $task->setId(1);
        $adapter->delete($task);

        $repository->expects($this->once())->method('findOneBy')->willReturn(null);
        $adapter->findByIdAndUserId(1, 'user-1');

        $repository->expects($this->once())->method('findBy')->willReturn([]);
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

    private function makeEntity(int $id, string $title, string $userId): TaskEntity
    {
        $entity = new TaskEntity();
        $entity->setId($id);
        $entity->setTitle($title);
        $entity->setUserId($userId);
        $entity->setDescription(null);
        $entity->setPriority(Priority::Middle);
        $entity->setDone(false);
        $entity->setScheduledFor(ScheduledFor::Today);
        $entity->setEstimatedTime(null);
        $entity->setPosition(0);
        $entity->setCreatedAt(new \DateTimeImmutable());

        return $entity;
    }
}
