<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine\Adapter\User;

use App\Core\Domain\Entity\User\User;
use App\Core\Domain\Repository\User\UserRepositoryInterface;
use App\Infrastructure\Persistence\Doctrine\Mapper\User\UserMapper;
use App\Infrastructure\Persistence\Doctrine\Repository\UserEntityRepositoryInterface;
use Psr\Cache\InvalidArgumentException;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

final readonly class UserRepositoryAdapter implements UserRepositoryInterface
{
    private const int TTL = 3600;

    public function __construct(
        private UserEntityRepositoryInterface $repository,
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
            $entity = $this->repository->findByEmail($email);

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
            $entity = $this->repository->findById($id);

            return $entity !== null ? UserMapper::toDomain($entity) : null;
        });
    }
}
