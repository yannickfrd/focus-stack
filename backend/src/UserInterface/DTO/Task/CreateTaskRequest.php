<?php

declare(strict_types=1);

namespace App\UserInterface\DTO\Task;

use Symfony\Component\Validator\Constraints as Assert;

readonly class CreateTaskRequest
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Length(max: 255)]
        public string $title,

        public ?string $description = null,

        #[Assert\Choice(choices: ['high', 'middle', 'low'])]
        public string $priority = 'middle',

        #[Assert\Choice(choices: ['today', 'tomorrow'], allowNull: true)]
        public ?string $scheduledFor = 'today',

        #[Assert\Length(max: 50)]
        public ?string $estimatedTime = null,
    ) {}
}
