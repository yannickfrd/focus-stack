<?php

declare(strict_types=1);

namespace App\Core\Application\UseCase\Routine;

use App\Core\Application\Request\Routine\CreateRoutineRequest;
use App\Core\Domain\Entity\Routine\Routine;
use App\Core\Domain\Repository\Routine\RoutineRepositoryInterface;
use App\Core\Domain\Service\UuidGeneratorInterface;

final readonly class CreateRoutineUseCase
{
    private const array COLOR_PALETTE = [
        '#22c55e', '#86efac',
        '#6366f1', '#a5b4fc',
        '#eab308', '#fde047',
        '#3b82f6', '#93c5fd',
        '#f97316', '#fdba74',
        '#ec4899', '#f9a8d4',
        '#8b5cf6', '#c4b5fd',
        '#14b8a6', '#5eead4',
        '#ef4444', '#fca5a5',
        '#06b6d4', '#67e8f9',
    ];

    public function __construct(
        private RoutineRepositoryInterface $routineRepository,
        private UuidGeneratorInterface $uuidGenerator,
    ) {}

    public function execute(string $userId, CreateRoutineRequest $request): Routine
    {
        $color = $request->color ?? $this->pickColor($userId);

        $routine = Routine::create(
            id: $this->uuidGenerator->generate(),
            title: $request->title,
            userId: $userId,
            color: $color,
        );

        $this->routineRepository->save($routine);

        return $routine;
    }

    private function pickColor(string $userId): string
    {
        $usedColors = $this->routineRepository->findColorsByUserId($userId);
        $available = array_diff(self::COLOR_PALETTE, $usedColors);

        $pool = $available !== [] ? array_values($available) : self::COLOR_PALETTE;

        return $pool[array_rand($pool)];
    }
}
