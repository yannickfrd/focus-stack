<?php

declare(strict_types=1);

namespace App\UserInterface\DTO\Task;

use Symfony\Component\Validator\Constraints as Assert;

readonly class ReorderTasksRequest
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\All([
            new Assert\Type('integer'),
            new Assert\Positive(),
        ])]
        public array $ids,
    ) {}
}
