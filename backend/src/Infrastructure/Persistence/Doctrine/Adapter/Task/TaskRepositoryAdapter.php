<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Adapter\Task;

use App\Core\Domain\Entity\Task\Task;
use App\Core\Domain\Entity\Task\TaskList;
use App\Core\Domain\Repository\Task\TaskRepositoryInterface;
use App\Infrastructure\Persistence\Doctrine\Entity\TaskEntity;
use App\Infrastructure\Persistence\Doctrine\Mapper\Task\TaskMapper;
use App\Infrastructure\Persistence\Doctrine\Repository\DoctrineTaskRepository;
use Symfony\Component\DependencyInjection\Attribute\AsAlias;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

#[AsAlias(TaskRepositoryInterface::class)]
final readonly class TaskRepositoryAdapter implements TaskRepositoryInterface
{
    private const int TTL = 3600;

    public function __construct(
        private DoctrineTaskRepository $repository,
        private CacheInterface $cache,
    ) {}

    public function save(Task $task): void
    {
        /** @var TaskEntity|null $entity */
        $entity = $this->repository->find($task->getId());
        if ($entity !== null) {
            TaskMapper::updateEntity($task, $entity);
            $this->repository->save($entity);
            $this->invalidateTask($task->getId(), $task->getUserId());

            return;
        }

        $entity = TaskMapper::toEntity($task);
        $this->repository->save($entity);
        $this->invalidateUserCache($task->getUserId());
    }

    public function saveAll(TaskList $taskList): void
    {
        $entities = [];
        $userIds = [];
        foreach ($taskList->tasks() as $task) {
            /** @var TaskEntity|null $entity */
            $entity = $this->repository->find($task->getId());
            if ($entity !== null) {
                TaskMapper::updateEntity($task, $entity);
                $entities[] = $entity;
                $userIds[$task->getUserId()] = true;
            }
        }

        $this->repository->saveAll($entities);

        foreach (array_keys($userIds) as $userId) {
            $this->invalidateUserCache($userId);
        }
    }

    public function findByIdAndUserId(string $id, string $userId): ?Task
    {
        return $this->cache->get("task.{$id}.{$userId}", function (ItemInterface $item) use ($id, $userId): ?Task {
            $item->expiresAfter(self::TTL);

            /** @var TaskEntity|null $entity */
            $entity = $this->repository->findOneBy(['id' => $id, 'userId' => $userId]);

            return $entity !== null ? TaskMapper::toDomain($entity) : null;
        });
    }

    public function findAllByUserId(string $userId): TaskList
    {
        return $this->cache->get("task.list.{$userId}", function (ItemInterface $item) use ($userId): TaskList {
            $item->expiresAfter(self::TTL);

            /** @var TaskEntity[] $entities */
            $entities = $this->repository->findBy(['userId' => $userId], ['position' => 'ASC']);

            return new TaskList(array_map(TaskMapper::toDomain(...), $entities));
        });
    }

    public function countByUserId(string $userId): int
    {
        return $this->cache->get("task.count.{$userId}", function (ItemInterface $item) use ($userId): int {
            $item->expiresAfter(self::TTL);

            return $this->repository->count(['userId' => $userId]);
        });
    }

    public function delete(Task $task): void
    {
        /** @var TaskEntity|null $entity */
        $entity = $this->repository->find($task->getId());
        if ($entity !== null) {
            $this->repository->delete($entity);
            $this->invalidateTask($task->getId(), $task->getUserId());
        }
    }

    private function invalidateTask(string $id, string $userId): void
    {
        $this->cache->delete("task.{$id}.{$userId}");
        $this->invalidateUserCache($userId);
    }

    private function invalidateUserCache(string $userId): void
    {
        $this->cache->delete("task.list.{$userId}");
        $this->cache->delete("task.count.{$userId}");
    }
}
