<?php

declare(strict_types=1);

namespace App\Tests\Unit\UserInterface\EventSubscriber;

use App\Core\Application\UseCase\RefreshToken\CreateRefreshTokenUseCase;
use App\Core\Domain\Entity\RefreshToken\RefreshToken;
use App\Infrastructure\Persistence\Doctrine\Entity\UserEntity;
use App\UserInterface\EventSubscriber\JwtAuthenticationSuccessSubscriber;
use App\UserInterface\Presenter\User\AuthenticationSuccessPresenter;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\User\InMemoryUser;

final class JwtAuthenticationSuccessSubscriberTest extends TestCase
{
    private JwtAuthenticationSuccessSubscriber $subscriber;
    private CreateRefreshTokenUseCase $createRefreshTokenUseCase;

    protected function setUp(): void
    {
        $this->createRefreshTokenUseCase = $this->createStub(CreateRefreshTokenUseCase::class);
        $this->createRefreshTokenUseCase->method('execute')->willReturn(
            RefreshToken::create('fixed-uuid', 'user-id', new \DateTimeImmutable('+30 days'))
        );

        $this->subscriber = new JwtAuthenticationSuccessSubscriber(
            new AuthenticationSuccessPresenter(),
            $this->createRefreshTokenUseCase,
        );
    }

    public function testSubscribesToAuthenticationSuccess(): void
    {
        $this->assertArrayHasKey(Events::AUTHENTICATION_SUCCESS, JwtAuthenticationSuccessSubscriber::getSubscribedEvents());
    }

    public function testAddsUserDataAndRefreshTokenToResponseOnSuccess(): void
    {
        $user = $this->makeUserEntity('uuid-1', 'user@example.com');
        $event = new AuthenticationSuccessEvent(['token' => 'jwt.token'], $user, new Response());

        $this->subscriber->onAuthenticationSuccess($event);

        $data = $event->getData();
        $this->assertSame('jwt.token', $data['token']);
        $this->assertSame(['id' => 'uuid-1', 'email' => 'user@example.com'], $data['user']);
        $this->assertSame('fixed-uuid', $data['refresh_token']);
    }

    public function testIgnoresNonUserEntityUsers(): void
    {
        $user = new InMemoryUser('other@example.com', null);
        $event = new AuthenticationSuccessEvent(['token' => 'jwt.token'], $user, new Response());

        $this->subscriber->onAuthenticationSuccess($event);

        $this->assertArrayNotHasKey('user', $event->getData());
        $this->assertArrayNotHasKey('refresh_token', $event->getData());
    }

    public function testPresenterIsCalledWithTheAuthenticatedUser(): void
    {
        $user = $this->makeUserEntity('uuid-2', 'me@example.com');
        $presenter = $this->createMock(AuthenticationSuccessPresenter::class);
        $presenter->expects($this->once())->method('present')->with($user)->willReturn(['id' => 'uuid-2', 'email' => 'me@example.com']);

        $subscriber = new JwtAuthenticationSuccessSubscriber($presenter, $this->createRefreshTokenUseCase);
        $event = new AuthenticationSuccessEvent(['token' => 'jwt'], $user, new Response());
        $subscriber->onAuthenticationSuccess($event);
    }

    private function makeUserEntity(string $id, string $email): UserEntity
    {
        $entity = new UserEntity();
        $entity->setId($id);
        $entity->setEmail($email);
        $entity->setPasswordHash('hash');
        $entity->setCreatedAt(new \DateTimeImmutable());

        return $entity;
    }
}
