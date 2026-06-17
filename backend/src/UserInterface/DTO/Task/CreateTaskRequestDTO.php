<?php

declare(strict_types=1);

namespace App\UserInterface\DTO\Task;

use App\Core\Application\Request\Task\CreateTaskRequest;
use App\Core\Domain\Entity\Task\Priority;
use App\Core\Domain\Entity\Task\ScheduledFor;
use Symfony\Component\Validator\Constraints as Assert;

readonly final class CreateTaskRequestDTO
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Length(max: 255)]
        public string $title,

        public ?string $description = null,

        #[Assert\Choice(callback: [Priority::class, 'values'])]
        public string $priority = 'middle',

        #[Assert\Choice(callback: [ScheduledFor::class, 'values'])]
        public ?string $scheduledFor = 'today',

        #[Assert\Regex(pattern: '/^([1-8]h( (15|30|45)m)?|(15|30|45)m)$/')]
        public ?string $estimatedTime = null,
    ) {}

    public function toRequest(): CreateTaskRequest
    {
        return new CreateTaskRequest(
            title: $this->title,
            description: $this->description,
            priority: Priority::from($this->priority),
            scheduledFor: $this->scheduledFor !== null ? ScheduledFor::from($this->scheduledFor) : null,
            estimatedTime: $this->estimatedTime,
        );
    }
}
