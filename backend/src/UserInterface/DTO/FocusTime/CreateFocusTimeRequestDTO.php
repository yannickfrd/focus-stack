<?php

declare(strict_types=1);

namespace App\UserInterface\DTO\FocusTime;

use App\Core\Application\Request\FocusTime\CreateFocusTimeRequest;
use Symfony\Component\Validator\Constraints as Assert;

readonly final class CreateFocusTimeRequestDTO
{
    public function __construct(
        #[Assert\NotNull]
        #[Assert\Positive]
        #[Assert\LessThanOrEqual(value: 480)]
        public int $duration,

        #[Assert\Uuid]
        public ?string $taskId = null,
    ) {}

    public function toRequest(): CreateFocusTimeRequest
    {
        return new CreateFocusTimeRequest(
            duration: $this->duration,
            taskId: $this->taskId,
        );
    }
}
