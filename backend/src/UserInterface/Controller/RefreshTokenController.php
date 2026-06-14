<?php

declare(strict_types=1);

namespace App\UserInterface\Controller;

use App\Core\Application\UseCase\RefreshToken\RefreshTokenUseCase;
use App\UserInterface\Presenter\RefreshToken\RefreshTokenPresenter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

final class RefreshTokenController extends AbstractController
{
    public function __construct(
        private readonly RefreshTokenUseCase $refreshTokenUseCase,
        private readonly RefreshTokenPresenter $presenter,
    ) {}

    #[Route('/token/refresh', name: 'token_refresh', methods: ['POST'])]
    public function refresh(Request $request): JsonResponse
    {
        $result = $this->refreshTokenUseCase->execute(
            $request->cookies->get('refresh_token', '')
        );

        $response = $this->json($this->presenter->present($result));

        $response->headers->setCookie(
            Cookie::create('refresh_token')
                ->withValue($result->refreshToken->getToken())
                ->withExpires($result->refreshToken->getExpiresAt())
                ->withPath('/')
                ->withHttpOnly(true)
                ->withSameSite('strict')
                ->withSecure($request->isSecure())
        );

        return $response;
    }
}
