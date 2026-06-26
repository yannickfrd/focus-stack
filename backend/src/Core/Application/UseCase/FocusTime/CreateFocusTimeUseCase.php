<?php

declare(strict_types=1);

namespace App\Core\Application\UseCase\FocusTime;

use App\Core\Application\Request\FocusTime\CreateFocusTimeRequest;
use App\Core\Domain\Entity\FocusTime\FocusTime;
use App\Core\Domain\Repository\FocusTime\FocusTimeRepositoryInterface;
use App\Core\Domain\Service\UuidGeneratorInterface;

final readonly class CreateFocusTimeUseCase
{
    public function __construct(
        private FocusTimeRepositoryInterface $focusTimeRepository,
        private UuidGeneratorInterface $uuidGenerator,
    ) {}

    public function execute(string $userId, CreateFocusTimeRequest $request): FocusTime
    {
        $focusTime = FocusTime::create(
            id: $this->uuidGenerator->generate(),
            userId: $userId,
            duration: $request->duration,
            taskId: $request->taskId,
        );

        $this->focusTimeRepository->save($focusTime);

        return $focusTime;
    }
}
