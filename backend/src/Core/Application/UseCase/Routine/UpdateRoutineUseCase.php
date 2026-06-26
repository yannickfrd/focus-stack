<?php

declare(strict_types=1);

namespace App\Core\Application\UseCase\Routine;

use App\Core\Application\Request\Routine\UpdateRoutineRequest;
use App\Core\Domain\Entity\Routine\Routine;
use App\Core\Domain\Exception\NotFoundException;
use App\Core\Domain\Repository\Routine\RoutineRepositoryInterface;

final readonly class UpdateRoutineUseCase
{
    public function __construct(
        private RoutineRepositoryInterface $routineRepository,
    ) {}

    public function execute(string $routineId, string $userId, UpdateRoutineRequest $request): Routine
    {
        $routine = $this->routineRepository->findByIdAndUserId($routineId, $userId);

        if ($routine === null) {
            throw new NotFoundException('Routine not found.');
        }

        $updated = Routine::update($routine, $request->title, $request->color);

        $this->routineRepository->save($updated);

        return $updated;
    }
}
