<?php

declare(strict_types=1);

namespace App\UserInterface\DTO\Task;

use Symfony\Component\Validator\Constraints as Assert;

readonly class UpdateTaskRequest
{
    public function __construct(
        #[Assert\Length(max: 255)]
        public ?string $title = null,

        public ?string $description = null,

        #[Assert\Choice(choices: ['high', 'middle', 'low'])]
        public ?string $priority = null,

        #[Assert\Length(max: 50)]
        public ?string $estimatedTime = null,

        public ?bool $done = null,

        #[Assert\Choice(choices: ['today', 'tomorrow'])]
        public ?string $scheduledFor = null,
    ) {}
}
