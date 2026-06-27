<?php

declare(strict_types=1);

namespace App\UserInterface\DTO\Routine;

use App\Core\Application\Request\Routine\UpdateRoutineRequest;
use Symfony\Component\Validator\Constraints as Assert;

readonly final class UpdateRoutineRequestDTO
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Length(max: 255)]
        public string $title,

        #[Assert\Regex(pattern: '/^#[0-9a-fA-F]{6}$/')]
        public ?string $color = null,
    ) {}

    public function toRequest(): UpdateRoutineRequest
    {
        return new UpdateRoutineRequest(
            title: $this->title,
            color: $this->color,
        );
    }
}
