<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Adapter\FocusTime;

use App\Core\Domain\Entity\FocusTime\FocusTime;
use App\Core\Domain\Repository\FocusTime\FocusTimeRepositoryInterface;
use App\Infrastructure\Persistence\Doctrine\Mapper\FocusTime\FocusTimeMapper;
use App\Infrastructure\Persistence\Doctrine\Repository\DoctrineFocusTimeRepository;
use Symfony\Component\DependencyInjection\Attribute\AsAlias;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

#[AsAlias(FocusTimeRepositoryInterface::class)]
final readonly class FocusTimeRepositoryAdapter implements FocusTimeRepositoryInterface
{
    private const int TTL = 3600;

    public function __construct(
        private DoctrineFocusTimeRepository $repository,
        private CacheInterface $cache,
    ) {}

    public function save(FocusTime $focusTime): void
    {
        $entity = FocusTimeMapper::toEntity($focusTime);
        $this->repository->save($entity);
        $focusTime->setId($entity->getId());
        $this->cache->delete("focus_time.list.{$focusTime->getUserId()}");
    }

    public function findAllByUserId(string $userId): array
    {
        return $this->cache->get("focus_time.list.{$userId}", function (ItemInterface $item) use ($userId): array {
            $item->expiresAfter(self::TTL);

            /** @var \App\Infrastructure\Persistence\Doctrine\Entity\FocusTimeEntity[] $entities */
            $entities = $this->repository->findBy(['userId' => $userId], ['completedAt' => 'DESC']);

            return array_map(FocusTimeMapper::toDomain(...), $entities);
        });
    }
}
