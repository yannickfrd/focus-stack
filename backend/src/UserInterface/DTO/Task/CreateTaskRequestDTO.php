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

        #[Assert\Choice(choices: ['high', 'middle', 'low'])]
        public string $priority = 'middle',

        #[Assert\Choice(choices: ['today', 'tomorrow'])]
        public ?string $scheduledFor = 'today',

        #[Assert\Length(max: 50)]
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
