<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Adapter\User;

use App\Core\Domain\Entity\User\User;
use App\Core\Domain\Repository\User\UserRepositoryInterface;
use App\Infrastructure\Persistence\Doctrine\Entity\UserEntity;
use App\Infrastructure\Persistence\Doctrine\Mapper\User\UserMapper;
use App\Infrastructure\Persistence\Doctrine\Repository\DoctrineUserRepository;
use Psr\Cache\InvalidArgumentException;
use Symfony\Component\DependencyInjection\Attribute\AsAlias;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

#[AsAlias(UserRepositoryInterface::class)]
final readonly class UserRepositoryAdapter implements UserRepositoryInterface
{
    private const int TTL = 3600;

    public function __construct(
        private DoctrineUserRepository $repository,
        private CacheInterface $cache,
    ) {}

    public function save(User $user): void
    {
        $this->repository->save(UserMapper::toEntity($user));
    }

    /**
     * @throws InvalidArgumentException
     */
    public function findByEmail(string $email): ?User
    {
        return $this->cache->get('user.email.' . hash('sha256', $email), function (ItemInterface $item) use ($email): ?User {
            $item->expiresAfter(self::TTL);
            /** @var UserEntity|null $entity */
            $entity = $this->repository->findOneBy(['email' => $email]);

            return $entity !== null ? UserMapper::toDomain($entity) : null;
        });
    }

    /**
     * @throws InvalidArgumentException
     */
    public function findById(string $id): ?User
    {
        return $this->cache->get('user.id.' . $id, function (ItemInterface $item) use ($id): ?User {
            $item->expiresAfter(self::TTL);
            /** @var UserEntity|null $entity */
            $entity = $this->repository->find($id);

            return $entity !== null ? UserMapper::toDomain($entity) : null;
        });
    }
}
