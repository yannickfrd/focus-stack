<?php

declare(strict_types=1);

namespace App\Core\Domain\Repository\FocusTime;

use App\Core\Domain\Entity\FocusTime\FocusTime;

interface FocusTimeRepositoryInterface
{
    public function save(FocusTime $focusTime): void;

    /** @return FocusTime[] */
    public function findAllByUserId(string $userId): array;
}
