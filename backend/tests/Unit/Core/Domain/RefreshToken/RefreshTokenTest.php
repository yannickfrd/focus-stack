<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Domain\RefreshToken;

use App\Core\Domain\Entity\RefreshToken\RefreshToken;
use PHPUnit\Framework\TestCase;

final class RefreshTokenTest extends TestCase
{
    public function testCreateSetsPropertiesCorrectly(): void
    {
        $expiresAt = new \DateTimeImmutable('+30 days');
        $token = RefreshToken::create('uuid-1', 'user-id', $expiresAt);

        $this->assertSame('uuid-1', $token->getId());
        $this->assertSame('uuid-1', $token->getToken());
        $this->assertSame('user-id', $token->getUserId());
        $this->assertSame($expiresAt, $token->getExpiresAt());
        $this->assertInstanceOf(\DateTimeImmutable::class, $token->getCreatedAt());
    }

    public function testSetCreatedAtOverridesDefault(): void
    {
        $createdAt = new \DateTimeImmutable('2024-01-01');
        $token = RefreshToken::create('id', 'uid', new \DateTimeImmutable('+30 days'))
            ->setCreatedAt($createdAt);

        $this->assertSame($createdAt, $token->getCreatedAt());
    }

    public function testIsExpiredReturnsTrueWhenPast(): void
    {
        $token = RefreshToken::create('id', 'uid', new \DateTimeImmutable('-1 second'));

        $this->assertTrue($token->isExpired());
    }

    public function testIsExpiredReturnsFalseWhenFuture(): void
    {
        $token = RefreshToken::create('id', 'uid', new \DateTimeImmutable('+30 days'));

        $this->assertFalse($token->isExpired());
    }
}
