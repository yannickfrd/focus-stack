<?php

declare(strict_types=1);

namespace App\Core\Application\UseCase\FocusTime;

use App\Core\Domain\Repository\FocusTime\FocusTimeRepositoryInterface;

final readonly class ListFocusTimesUseCase
{
    public function __construct(
        private FocusTimeRepositoryInterface $focusTimeRepository,
    ) {}

    /** @return \App\Core\Domain\Entity\FocusTime\FocusTime[] */
    public function execute(string $userId): array
    {
        return $this->focusTimeRepository->findAllByUserId($userId);
    }
}
