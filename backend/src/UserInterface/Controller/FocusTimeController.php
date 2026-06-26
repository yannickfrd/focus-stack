<?php

declare(strict_types=1);

namespace App\UserInterface\Controller;

use App\Core\Application\UseCase\FocusTime\CreateFocusTimeUseCase;
use App\Core\Application\UseCase\FocusTime\ListFocusTimesUseCase;
use App\Infrastructure\Persistence\Doctrine\Entity\UserEntity;
use App\UserInterface\DTO\FocusTime\CreateFocusTimeRequestDTO;
use App\UserInterface\Presenter\FocusTime\FocusTimePresenter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

final class FocusTimeController extends AbstractController
{
    public function __construct(
        private readonly CreateFocusTimeUseCase $createFocusTimeUseCase,
        private readonly ListFocusTimesUseCase $listFocusTimesUseCase,
        private readonly FocusTimePresenter $focusTimePresenter,
    ) {}

    #[Route('/focus-times', name: 'focus_time_create', methods: ['POST'])]
    public function create(#[MapRequestPayload] CreateFocusTimeRequestDTO $request): JsonResponse
    {
        /** @var UserEntity $user */
        $user = $this->getUser();

        $focusTime = $this->createFocusTimeUseCase->execute(
            userId: $user->getId(),
            request: $request->toRequest(),
        );

        return $this->json($this->focusTimePresenter->present($focusTime), Response::HTTP_CREATED);
    }

    #[Route('/focus-times', name: 'focus_time_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        /** @var UserEntity $user */
        $user = $this->getUser();

        $focusTimes = $this->listFocusTimesUseCase->execute($user->getId());

        return $this->json($this->focusTimePresenter->presentAll($focusTimes));
    }
}
