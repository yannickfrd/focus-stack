<?php

declare(strict_types=1);

namespace App\Core\Application\Request\Task;

use App\Core\Domain\Entity\Task\Priority;
use App\Core\Domain\Entity\Task\ScheduledFor;

readonly class CreateTaskRequest
{
    public function __construct(
        public string $title,
        public ?string $description,
        public Priority $priority,
        public ?ScheduledFor $scheduledFor,
        public ?string $estimatedTime,
    ) {}
}
