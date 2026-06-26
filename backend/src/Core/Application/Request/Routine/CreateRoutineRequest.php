<?php

declare(strict_types=1);

namespace App\Core\Application\Request\Routine;

readonly class CreateRoutineRequest
{
    public function __construct(
        public string $title,
        public ?string $color = null,
    ) {}
}
