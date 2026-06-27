<?php

declare(strict_types=1);

namespace App\UserInterface\Presenter\Routine;

use App\Core\Domain\Entity\Routine\Routine;

final class RoutinePresenter
{
    public function present(Routine $routine): array
    {
        return [
            'id' => $routine->getId(),
            'title' => $routine->getTitle(),
            'color' => $routine->getColor(),
            'createdAt' => $routine->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }

    /** @param Routine[] $routines */
    public function presentAll(array $routines): array
    {
        return array_map($this->present(...), $routines);
    }
}
