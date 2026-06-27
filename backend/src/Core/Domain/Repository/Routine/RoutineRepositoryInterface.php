<?php

declare(strict_types=1);

namespace App\Core\Domain\Repository\Routine;

use App\Core\Domain\Entity\Routine\Routine;

interface RoutineRepositoryInterface
{
    public function save(Routine $routine): void;

    /** @return Routine[] */
    public function findAllByUserId(string $userId): array;

    public function findByIdAndUserId(string $id, string $userId): ?Routine;

    public function delete(Routine $routine): void;

    /** @return string[] */
    public function findColorsByUserId(string $userId): array;
}
