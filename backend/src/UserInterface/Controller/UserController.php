<?php

declare(strict_types=1);

namespace App\UserInterface\Controller;

use App\Core\Application\UseCase\User\RegisterUserUseCase;
use App\UserInterface\DTO\User\RegisterUserRequest;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

final class UserController extends AbstractController
{
    public function __construct(
        private readonly RegisterUserUseCase $registerUserUseCase,
    ) {}

    #[Route('/login', name: 'user_login', methods: ['POST'])]
    public function login(): never
    {
        throw new \LogicException('Intercepted by the security firewall.');
    }

    #[Route('/register', name: 'user_register', methods: ['POST'])]
    public function register(#[MapRequestPayload] RegisterUserRequest $request): JsonResponse
    {
        $this->registerUserUseCase->execute($request->email, $request->password);

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
