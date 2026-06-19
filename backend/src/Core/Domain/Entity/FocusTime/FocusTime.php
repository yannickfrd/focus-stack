<?php

declare(strict_types=1);

namespace App\Core\Domain\Entity\FocusTime;

final class FocusTime
{
    private ?int $id = null;
    private ?int $taskId;
    private int $duration;
    private \DateTimeImmutable $completedAt;
    private string $userId;

    public function __construct()
    {
        $this->completedAt = new \DateTimeImmutable();
    }

    public static function create(
        string $userId,
        int $duration,
        ?int $taskId = null,
    ): self {
        $focusTime = new self();
        $focusTime->setUserId($userId);
        $focusTime->setDuration($duration);
        $focusTime->setTaskId($taskId);

        return $focusTime;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): self
    {
        $this->id = $id;

        return $this;
    }

    public function getTaskId(): ?int
    {
        return $this->taskId;
    }

    public function setTaskId(?int $taskId): self
    {
        $this->taskId = $taskId;

        return $this;
    }

    public function getDuration(): int
    {
        return $this->duration;
    }

    public function setDuration(int $duration): self
    {
        $this->duration = $duration;

        return $this;
    }

    public function getCompletedAt(): \DateTimeImmutable
    {
        return $this->completedAt;
    }

    public function setCompletedAt(\DateTimeImmutable $completedAt): self
    {
        $this->completedAt = $completedAt;

        return $this;
    }

    public function getUserId(): string
    {
        return $this->userId;
    }

    public function setUserId(string $userId): self
    {
        $this->userId = $userId;

        return $this;
    }
}
