<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Adapter\Routine;

use App\Core\Domain\Entity\Routine\Routine;
use App\Core\Domain\Repository\Routine\RoutineRepositoryInterface;
use App\Infrastructure\Persistence\Doctrine\Entity\RoutineEntity;
use App\Infrastructure\Persistence\Doctrine\Mapper\Routine\RoutineMapper;
use App\Infrastructure\Persistence\Doctrine\Repository\DoctrineRoutineRepository;
use Symfony\Component\DependencyInjection\Attribute\AsAlias;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

#[AsAlias(RoutineRepositoryInterface::class)]
final readonly class RoutineRepositoryAdapter implements RoutineRepositoryInterface
{
    private const int TTL = 3600;

    public function __construct(
        private DoctrineRoutineRepository $repository,
        private CacheInterface $cache,
    ) {}

    public function save(Routine $routine): void
    {
        /** @var RoutineEntity|null $entity */
        $entity = $this->repository->find($routine->getId());
        if ($entity !== null) {
            RoutineMapper::updateEntity($routine, $entity);
            $this->repository->save($entity);
        } else {
            $entity = RoutineMapper::toEntity($routine);
            $this->repository->save($entity);
        }

        $this->cache->delete("routine.list.{$routine->getUserId()}");
        $this->cache->delete("routine.colors.{$routine->getUserId()}");
    }

    public function findAllByUserId(string $userId): array
    {
        return $this->cache->get("routine.list.{$userId}", function (ItemInterface $item) use ($userId): array {
            $item->expiresAfter(self::TTL);

            /** @var RoutineEntity[] $entities */
            $entities = $this->repository->findBy(['userId' => $userId], ['createdAt' => 'ASC']);

            return array_map(RoutineMapper::toDomain(...), $entities);
        });
    }

    public function findByIdAndUserId(string $id, string $userId): ?Routine
    {
        /** @var RoutineEntity|null $entity */
        $entity = $this->repository->findOneBy(['id' => $id, 'userId' => $userId]);

        return $entity !== null ? RoutineMapper::toDomain($entity) : null;
    }

    public function delete(Routine $routine): void
    {
        /** @var RoutineEntity|null $entity */
        $entity = $this->repository->find($routine->getId());
        if ($entity !== null) {
            $this->repository->delete($entity);
        }

        $this->cache->delete("routine.list.{$routine->getUserId()}");
        $this->cache->delete("routine.colors.{$routine->getUserId()}");
    }

    public function findColorsByUserId(string $userId): array
    {
        return $this->cache->get("routine.colors.{$userId}", function (ItemInterface $item) use ($userId): array {
            $item->expiresAfter(self::TTL);

            return array_column(
                $this->repository->createQueryBuilder('r')
                    ->select('r.color')
                    ->where('r.userId = :userId')
                    ->andWhere('r.color IS NOT NULL')
                    ->setParameter('userId', $userId)
                    ->getQuery()
                    ->getArrayResult(),
                'color',
            );
        });
    }
}
