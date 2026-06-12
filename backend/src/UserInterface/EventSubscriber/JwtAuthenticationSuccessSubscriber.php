<?php

declare(strict_types=1);

namespace App\UserInterface\EventSubscriber;

use App\Core\Application\UseCase\RefreshToken\CreateRefreshTokenUseCase;
use App\Infrastructure\Persistence\Doctrine\Entity\UserEntity;
use App\UserInterface\Presenter\User\AuthenticationSuccessPresenter;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

final readonly class JwtAuthenticationSuccessSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private AuthenticationSuccessPresenter $presenter,
        private CreateRefreshTokenUseCase $createRefreshTokenUseCase,
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [Events::AUTHENTICATION_SUCCESS => 'onAuthenticationSuccess'];
    }

    public function onAuthenticationSuccess(AuthenticationSuccessEvent $event): void
    {
        $user = $event->getUser();

        if (!$user instanceof UserEntity) {
            return;
        }

        $refreshToken = $this->createRefreshTokenUseCase->execute($user->getId());

        $data = $event->getData();
        $data['user'] = $this->presenter->present($user);
        $data['refresh_token'] = $refreshToken->getToken();
        $event->setData($data);
    }
}
