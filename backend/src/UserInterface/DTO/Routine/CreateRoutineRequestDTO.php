<?php

declare(strict_types=1);

namespace App\UserInterface\DTO\Routine;

use App\Core\Application\Request\Routine\CreateRoutineRequest;
use Symfony\Component\Validator\Constraints as Assert;

readonly final class CreateRoutineRequestDTO
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Length(max: 255)]
        public string $title,

        #[Assert\Regex(pattern: '/^#[0-9a-fA-F]{6}$/')]
        public ?string $color = null,
    ) {}

    public function toRequest(): CreateRoutineRequest
    {
        return new CreateRoutineRequest(
            title: $this->title,
            color: $this->color,
        );
    }
}
