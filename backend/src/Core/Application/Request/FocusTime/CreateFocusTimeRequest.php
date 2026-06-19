<?php

declare(strict_types=1);

namespace App\Core\Application\Request\FocusTime;

readonly class CreateFocusTimeRequest
{
    public function __construct(
        public int $duration,
        public ?string $taskId,
    ) {}
}
