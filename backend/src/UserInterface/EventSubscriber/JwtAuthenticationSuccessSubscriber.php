<?php

declare(strict_types=1);

namespace App\UserInterface\EventSubscriber;

use App\Core\Application\UseCase\RefreshToken\CreateRefreshTokenUseCase;
use App\Infrastructure\Persistence\Doctrine\Entity\UserEntity;
use App\UserInterface\Presenter\User\AuthenticationSuccessPresenter;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\RequestStack;

final readonly class JwtAuthenticationSuccessSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private AuthenticationSuccessPresenter $presenter,
        private CreateRefreshTokenUseCase $createRefreshTokenUseCase,
        private RequestStack $requestStack,
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [Events::AUTHENTICATION_SUCCESS => 'onAuthenticationSuccess'];
    }

    /**
     * @throws \DateMalformedStringException
     */
    public function onAuthenticationSuccess(AuthenticationSuccessEvent $event): void
    {
        $user = $event->getUser();

        if (!$user instanceof UserEntity) {
            return;
        }

        $refreshToken = $this->createRefreshTokenUseCase->execute($user->getId());

        $event->getResponse()->headers->setCookie(
            Cookie::create('refresh_token')
                ->withValue($refreshToken->getToken())
                ->withExpires($refreshToken->getExpiresAt())
                ->withPath('/')
                ->withHttpOnly(true)
                ->withSameSite('lax')
                ->withSecure($this->requestStack->getCurrentRequest()?->isSecure() ?? false)
        );

        $data = $event->getData();
        $data['user'] = $this->presenter->present($user);
        $event->setData($data);
    }
}
