<?php

declare(strict_types=1);

namespace App\UserInterface\Presenter\FocusTime;

use App\Core\Domain\Entity\FocusTime\FocusTime;

final class FocusTimePresenter
{
    public function present(FocusTime $focusTime): array
    {
        return [
            'id' => $focusTime->getId(),
            'taskId' => $focusTime->getTaskId(),
            'duration' => $focusTime->getDuration(),
            'completedAt' => $focusTime->getCompletedAt()->format(\DateTimeInterface::ATOM),
        ];
    }

    /** @param FocusTime[] $focusTimes */
    public function presentAll(array $focusTimes): array
    {
        return array_map($this->present(...), $focusTimes);
    }
}
