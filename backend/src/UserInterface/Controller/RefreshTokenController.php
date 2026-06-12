<?php

declare(strict_types=1);

namespace App\UserInterface\Controller;

use App\Core\Application\Response\RefreshTokenResponse;
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
        try {
            $result = $this->refreshTokenUseCase->execute($request->refresh_token);
        } catch (\DomainException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json($this->presenter->present($result->accessToken, $result->refreshToken));
    }
}
