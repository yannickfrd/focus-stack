<?php

declare(strict_types=1);

namespace App\Core\Application\UseCase\Routine;

use App\Core\Domain\Exception\NotFoundException;
use App\Core\Domain\Repository\Routine\RoutineRepositoryInterface;

final readonly class DeleteRoutineUseCase
{
    public function __construct(
        private RoutineRepositoryInterface $routineRepository,
    ) {}

    public function execute(string $routineId, string $userId): void
    {
        $routine = $this->routineRepository->findByIdAndUserId($routineId, $userId);

        if ($routine === null) {
            throw new NotFoundException('Routine not found.');
        }

        $this->routineRepository->delete($routine);
    }
}
