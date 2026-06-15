<?php

declare(strict_types=1);

namespace App\Core\Domain\Entity\RefreshToken;

final class RefreshToken
{
    private string $id;
    private string $userId;
    private \DateTimeImmutable $expiresAt;
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public static function create(string $id, string $userId, \DateTimeImmutable $expiresAt): self
    {
        $token = new self();
        $token->id = $id;
        $token->userId = $userId;
        $token->expiresAt = $expiresAt;

        return $token;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getToken(): string
    {
        return $this->id;
    }

    public function getUserId(): string
    {
        return $this->userId;
    }

    public function getExpiresAt(): \DateTimeImmutable
    {
        return $this->expiresAt;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function isExpired(): bool
    {
        return $this->expiresAt < new \DateTimeImmutable();
    }
}
