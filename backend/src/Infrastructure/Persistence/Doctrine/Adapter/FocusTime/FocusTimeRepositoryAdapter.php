<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Adapter\FocusTime;

use App\Core\Domain\Entity\FocusTime\FocusTime;
use App\Core\Domain\Repository\FocusTime\FocusTimeRepositoryInterface;
use App\Infrastructure\Persistence\Doctrine\Entity\FocusTimeEntity;
use App\Infrastructure\Persistence\Doctrine\Mapper\FocusTime\FocusTimeMapper;
use App\Infrastructure\Persistence\Doctrine\Repository\DoctrineFocusTimeRepository;
use Psr\Cache\InvalidArgumentException;
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

    /**
     * @throws InvalidArgumentException
     */
    public function save(FocusTime $focusTime): void
    {
        $entity = FocusTimeMapper::toEntity($focusTime);
        $this->repository->save($entity);
        $this->cache->delete("focus_time.list.{$focusTime->getUserId()}");
    }

    /**
     * @throws InvalidArgumentException
     */
    public function findAllByUserId(string $userId): array
    {
        return $this->cache->get("focus_time.list.{$userId}", function (ItemInterface $item) use ($userId): array {
            $item->expiresAfter(self::TTL);

            /** @var FocusTimeEntity[] $entities */
            $entities = $this->repository->findBy(['userId' => $userId], ['completedAt' => 'DESC']);

            return array_map(FocusTimeMapper::toDomain(...), $entities);
        });
    }
}
