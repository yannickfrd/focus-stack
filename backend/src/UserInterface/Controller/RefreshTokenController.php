<?php

declare(strict_types=1);

namespace App\UserInterface\Controller;

use App\Core\Application\UseCase\RefreshToken\RefreshTokenUseCase;
use App\UserInterface\DTO\RefreshToken\RefreshTokenRequest;
use App\UserInterface\Presenter\RefreshToken\RefreshTokenPresenter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

final class RefreshTokenController extends AbstractController
{
    public function __construct(
        private readonly RefreshTokenUseCase $refreshTokenUseCase,
        private readonly RefreshTokenPresenter $presenter,
    ) {}

    #[Route('/token/refresh', name: 'token_refresh', methods: ['POST'])]
    public function refresh(#[MapRequestPayload] RefreshTokenRequest $request): JsonResponse
    {
        return $this->json(
            $this->presenter->present(
                $this->refreshTokenUseCase->execute($request->refresh_token)
            )
        );
    }
}
