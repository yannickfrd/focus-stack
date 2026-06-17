<?php

declare(strict_types=1);

namespace App\Core\Domain\Entity\Task;

final class Task
{
    private ?int $id = null;
    private string $title;
    private ?string $description;
    private Priority $priority;
    private bool $done;
    private ?ScheduledFor $scheduledFor;
    private ?string $estimatedTime;
    private int $position;
    private \DateTimeImmutable $createdAt;
    private string $userId;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public static function create(
        string $title,
        string $userId,
        ?string $description = null,
        Priority $priority = Priority::Middle,
        ?ScheduledFor $scheduledFor = ScheduledFor::Today,
        ?string $estimatedTime = null,
        int $position = 0,
    ): self {
        $task = new self();
        $task
            ->setTitle($title)
            ->setUserId($userId)
            ->setDescription($description)
            ->setPriority($priority)
            ->setScheduledFor($scheduledFor)
            ->setEstimatedTime($estimatedTime)
            ->setPosition($position)
            ->setDone(false)
        ;

        return $task;
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

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getPriority(): Priority
    {
        return $this->priority;
    }

    public function setPriority(Priority $priority): self
    {
        $this->priority = $priority;

        return $this;
    }

    public function isDone(): bool
    {
        return $this->done;
    }

    public function setDone(bool $done): self
    {
        $this->done = $done;

        return $this;
    }

    public function getScheduledFor(): ?ScheduledFor
    {
        return $this->scheduledFor;
    }

    public function setScheduledFor(?ScheduledFor $scheduledFor): self
    {
        $this->scheduledFor = $scheduledFor;

        return $this;
    }

    public function getEstimatedTime(): ?string
    {
        return $this->estimatedTime;
    }

    public function setEstimatedTime(?string $estimatedTime): self
    {
        $this->estimatedTime = $estimatedTime;

        return $this;
    }

    public function getPosition(): int
    {
        return $this->position;
    }

    public function setPosition(int $position): self
    {
        $this->position = $position;

        return $this;
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
