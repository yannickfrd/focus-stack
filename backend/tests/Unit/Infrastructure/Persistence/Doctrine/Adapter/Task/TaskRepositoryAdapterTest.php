<?php

declare(strict_types=1);

namespace App\Tests\Unit\Infrastructure\Persistence\Doctrine\Adapter\Task;

use App\Core\Domain\Entity\Task\Priority;
use App\Core\Domain\Entity\Task\ScheduledFor;
use App\Core\Domain\Entity\Task\Task;
use App\Core\Domain\Entity\Task\TaskList;
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

    private const string UUID1 = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    private const string UUID2 = 'b1ffcd00-0d1c-5fg9-cc7e-7cc0ce491b22';

    public function testFindByIdAndUserIdReturnsNullWhenNotFound(): void
    {
        $this->repository->method('findOneBy')->willReturn(null);

        $this->assertNull($this->adapter->findByIdAndUserId(self::UUID1, 'user-1'));
    }

    public function testFindByIdAndUserIdReturnsMappedDomainTask(): void
    {
        $entity = $this->makeEntity(self::UUID1, 'My Task', 'user-1');
        $this->repository->method('findOneBy')->willReturn($entity);

        $task = $this->adapter->findByIdAndUserId(self::UUID1, 'user-1');

        $this->assertInstanceOf(Task::class, $task);
        $this->assertSame(self::UUID1, $task->getId());
        $this->assertSame('My Task', $task->getTitle());
        $this->assertSame('user-1', $task->getUserId());
    }

    public function testFindByIdAndUserIdHitsRepositoryOnlyOnce(): void
    {
        $repository = $this->createFinalMock(DoctrineTaskRepository::class);
        $repository->expects($this->once())->method('findOneBy')->willReturn($this->makeEntity(self::UUID1, 'Task', 'user-1'));

        $adapter = new TaskRepositoryAdapter($repository, $this->cache);
        $adapter->findByIdAndUserId(self::UUID1, 'user-1');
        $adapter->findByIdAndUserId(self::UUID1, 'user-1');
    }

    public function testFindAllByUserIdReturnsEmptyTaskList(): void
    {
        $this->repository->method('findBy')->willReturn([]);

        $result = $this->adapter->findAllByUserId('user-1');

        $this->assertInstanceOf(TaskList::class, $result);
        $this->assertSame([], $result->tasks());
    }

    public function testFindAllByUserIdReturnsMappedTaskList(): void
    {
        $entity1 = $this->makeEntity(self::UUID1, 'Task A', 'user-1');
        $entity2 = $this->makeEntity(self::UUID2, 'Task B', 'user-1');
        $this->repository->method('findBy')->willReturn([$entity1, $entity2]);

        $taskList = $this->adapter->findAllByUserId('user-1');

        $this->assertCount(2, $taskList->tasks());
        $this->assertSame('Task A', $taskList->tasks()[0]->getTitle());
        $this->assertSame('Task B', $taskList->tasks()[1]->getTitle());
    }

    public function testFindAllByUserIdHitsRepositoryOnlyOnce(): void
    {
        $repository = $this->createFinalMock(DoctrineTaskRepository::class);
        $repository->expects($this->once())->method('findBy')->willReturn([$this->makeEntity(self::UUID1, 'Task', 'user-1')]);

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

    public function testSaveNewTaskPersistsEntity(): void
    {
        $repository = $this->createFinalMock(DoctrineTaskRepository::class);
        $repository->method('find')->with(self::UUID1)->willReturn(null);
        $repository->expects($this->once())->method('save')
            ->with($this->isInstanceOf(TaskEntity::class));

        $task = Task::create(self::UUID1, 'New Task', 'user-1');
        (new TaskRepositoryAdapter($repository, $this->cache))->save($task);

        $this->assertSame(self::UUID1, $task->getId());
    }

    public function testSaveUpdatesExistingEntityWhenTaskHasId(): void
    {
        $entity = $this->makeEntity(self::UUID1, 'Old Title', 'user-1');

        $repository = $this->createFinalMock(DoctrineTaskRepository::class);
        $repository->method('find')->with(self::UUID1)->willReturn($entity);
        $repository->expects($this->once())->method('save')->with($entity);

        $task = Task::create(self::UUID1, 'New Title', 'user-1');

        (new TaskRepositoryAdapter($repository, $this->cache))->save($task);
    }

    public function testSaveInvalidatesTaskAndUserCaches(): void
    {
        $entity = $this->makeEntity(self::UUID1, 'Task', 'user-1');

        $repository = $this->createFinalMock(DoctrineTaskRepository::class);
        $repository->method('findOneBy')->willReturn($entity);
        $repository->method('find')->willReturn($entity);
        $repository->method('save');

        $adapter = new TaskRepositoryAdapter($repository, $this->cache);

        $adapter->findByIdAndUserId(self::UUID1, 'user-1');
        $adapter->findAllByUserId('user-1');

        $task = Task::create(self::UUID1, 'Updated', 'user-1');
        $adapter->save($task);

        $repository->expects($this->once())->method('findOneBy')->willReturn($entity);
        $adapter->findByIdAndUserId(self::UUID1, 'user-1');

        $repository->expects($this->once())->method('findBy')->willReturn([$entity]);
        $adapter->findAllByUserId('user-1');
    }

    public function testSaveAllDelegatesToRepository(): void
    {
        $entity = $this->makeEntity(self::UUID1, 'Task', 'user-1');

        $repository = $this->createFinalMock(DoctrineTaskRepository::class);
        $repository->method('find')->with(self::UUID1)->willReturn($entity);
        $repository->expects($this->once())->method('saveAll');

        $taskList = new TaskList([Task::create(self::UUID1, 'Task', 'user-1')]);

        (new TaskRepositoryAdapter($repository, $this->cache))->saveAll($taskList);
    }

    public function testDeleteDelegatesToRepository(): void
    {
        $entity = $this->makeEntity(self::UUID1, 'Task', 'user-1');

        $repository = $this->createFinalMock(DoctrineTaskRepository::class);
        $repository->method('find')->with(self::UUID1)->willReturn($entity);
        $repository->expects($this->once())->method('delete')->with($entity);

        $task = Task::create(self::UUID1, 'Task', 'user-1');

        (new TaskRepositoryAdapter($repository, $this->cache))->delete($task);
    }

    public function testDeleteInvalidatesCaches(): void
    {
        $entity = $this->makeEntity(self::UUID1, 'Task', 'user-1');

        $repository = $this->createFinalMock(DoctrineTaskRepository::class);
        $repository->method('findOneBy')->willReturn($entity);
        $repository->method('findBy')->willReturn([$entity]);
        $repository->method('find')->willReturn($entity);
        $repository->method('delete');

        $adapter = new TaskRepositoryAdapter($repository, $this->cache);

        $adapter->findByIdAndUserId(self::UUID1, 'user-1');
        $adapter->findAllByUserId('user-1');

        $task = Task::create(self::UUID1, 'Task', 'user-1');
        $adapter->delete($task);

        $repository->expects($this->once())->method('findOneBy')->willReturn(null);
        $adapter->findByIdAndUserId(self::UUID1, 'user-1');

        $repository->expects($this->once())->method('findBy')->willReturn([]);
        $adapter->findAllByUserId('user-1');
    }

    /**
     * @template T of object
     * @param class-string<T> $class
     * @return T&\PHPUnit\Framework\MockObject\MockObject
     */
    private function createFinalMock(string $class): \PHPUnit\Framework\MockObject\MockObject
    {
        return $this->createMock($class);
    }

    /**
     * @template T of object
     * @param class-string<T> $class
     * @return T&\PHPUnit\Framework\MockObject\Stub
     */
    private function createFinalStub(string $class): \PHPUnit\Framework\MockObject\Stub
    {
        return $this->createStub($class);
    }

    private function makeEntity(string $id, string $title, string $userId): TaskEntity
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
