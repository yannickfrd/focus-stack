<?php

declare(strict_types=1);

namespace App\Core\Domain\Entity\Routine;

final class Routine
{
    private string $id;
    private string $title;
    private ?string $color;
    private string $userId;
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public static function create(
        string $id,
        string $title,
        string $userId,
        ?string $color = null,
    ): self {
        $routine = new self();
        $routine->id = $id;
        $routine->title = $title;
        $routine->userId = $userId;
        $routine->color = $color;

        return $routine;
    }

    public static function update(self $routine, string $title, ?string $color): self
    {
        $updated = clone $routine;
        $updated->title = $title;
        $updated->color = $color;

        return $updated;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function getColor(): ?string
    {
        return $this->color;
    }

    public function setColor(?string $color): self
    {
        $this->color = $color;

        return $this;
    }

    public function getUserId(): string
    {
        return $this->userId;
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
}
