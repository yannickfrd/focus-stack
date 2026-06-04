<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Domain\User;

use App\Core\Domain\Repository\User\User;
use PHPUnit\Framework\TestCase;

final class UserTest extends TestCase
{
    public function testCreateSetsPropertiesCorrectly(): void
    {
        $user = User::create('uuid-123', 'test@example.com', 'hashed');

        $this->assertSame('uuid-123', $user->getId());
        $this->assertSame('test@example.com', $user->getEmail());
        $this->assertSame('hashed', $user->getPasswordHash());
        $this->assertInstanceOf(\DateTimeImmutable::class, $user->getCreatedAt());
    }

    public function testSetCreatedAtOverridesDefault(): void
    {
        $createdAt = new \DateTimeImmutable('2024-01-01');
        $user = User::create('uuid-123', 'test@example.com', 'hashed')->setCreatedAt($createdAt);

        $this->assertSame($createdAt, $user->getCreatedAt());
    }
}
