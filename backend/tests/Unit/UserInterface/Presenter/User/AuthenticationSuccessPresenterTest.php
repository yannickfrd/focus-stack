<?php

declare(strict_types=1);

namespace App\Tests\Unit\UserInterface\Presenter\User;

use App\Infrastructure\Persistence\Doctrine\Entity\UserEntity;
use App\UserInterface\Presenter\User\AuthenticationSuccessPresenter;
use PHPUnit\Framework\TestCase;

final class AuthenticationSuccessPresenterTest extends TestCase
{
    public function testPresentReturnsIdAndEmail(): void
    {
        $user = new UserEntity();
        $user->setId('uuid-1');
        $user->setEmail('user@example.com');
        $user->setPasswordHash('hash');
        $user->setCreatedAt(new \DateTimeImmutable());

        $result = (new AuthenticationSuccessPresenter())->present($user);

        $this->assertSame(['id' => 'uuid-1', 'email' => 'user@example.com'], $result);
    }
}
