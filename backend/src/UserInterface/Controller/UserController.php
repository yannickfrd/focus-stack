<?php

declare(strict_types=1);

namespace App\UserInterface\Controller;

use App\Core\Application\UseCase\User\RegisterUserUseCase;
use App\UserInterface\DTO\User\RegisterUserRequest;
use App\UserInterface\Presenter\User\RegisterUserPresenter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

final class UserController extends AbstractController
{
    public function __construct(
        private readonly RegisterUserUseCase $registerUserUseCase,
        private readonly RegisterUserPresenter $presenter,
    ) {}

    #[Route('/register', name: 'user_register', methods: ['POST'])]
    public function register(#[MapRequestPayload] RegisterUserRequest $request): JsonResponse
    {
        $user = $this->registerUserUseCase->execute($request->email, $request->password);

        return $this->json(
            $this->presenter->present($user),
            Response::HTTP_CREATED
        );
    }
}
