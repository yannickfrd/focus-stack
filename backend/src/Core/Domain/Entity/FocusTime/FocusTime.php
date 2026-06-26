<?php

declare(strict_types=1);

namespace App\Core\Domain\Entity\FocusTime;

final class FocusTime
{
    private string $id;
    private ?string $taskId;
    private int $duration;
    private \DateTimeImmutable $completedAt;
    private string $userId;

    public function __construct()
    {
        $this->completedAt = new \DateTimeImmutable();
    }

    public static function create(
        string $id,
        string $userId,
        int $duration,
        ?string $taskId = null,
    ): self {
        $focusTime = new self();
        $focusTime->id = $id;
        $focusTime->setUserId($userId);
        $focusTime->setDuration($duration);
        $focusTime->setTaskId($taskId);

        return $focusTime;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getTaskId(): ?string
    {
        return $this->taskId;
    }

    public function setTaskId(?string $taskId): self
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
