<?php

declare(strict_types=1);

namespace App\UserInterface\DTO\Task;

use App\Core\Application\Request\Task\UpdateTaskRequest;
use App\Core\Domain\Entity\Task\Priority;
use App\Core\Domain\Entity\Task\ScheduledFor;
use Symfony\Component\Validator\Constraints as Assert;

readonly final class UpdateTaskRequestDTO
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Length(max: 255)]
        public string $title,

        public ?string $description = null,

        #[Assert\Choice(callback: [Priority::class, 'values'])]
        public string $priority = 'middle',

        #[Assert\Regex(pattern: '/^([1-8]h( (15|30|45)m)?|(15|30|45)m)$/')]
        public ?string $estimatedTime = null,

        public bool $done = false,

        #[Assert\Choice(callback: [ScheduledFor::class, 'values'])]
        public ?string $scheduledFor = null,
    ) {}

    public function toRequest(): UpdateTaskRequest
    {
        return new UpdateTaskRequest(
            title: $this->title,
            description: $this->description,
            priority: Priority::from($this->priority),
            estimatedTime: $this->estimatedTime,
            done: $this->done,
            scheduledFor: $this->scheduledFor !== null ? ScheduledFor::from($this->scheduledFor) : null,
        );
    }
}
