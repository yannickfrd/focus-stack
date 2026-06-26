<?php

declare(strict_types=1);

namespace App\Core\Application\UseCase\Routine;

use App\Core\Domain\Entity\Routine\Routine;
use App\Core\Domain\Repository\Routine\RoutineRepositoryInterface;

final readonly class ListRoutinesUseCase
{
    public function __construct(
        private RoutineRepositoryInterface $routineRepository,
    ) {}

    /** @return Routine[] */
    public function execute(string $userId): array
    {
        return $this->routineRepository->findAllByUserId($userId);
    }
}
